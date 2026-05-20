# -*- coding: utf-8 -*-
"""
川名堂本地 JSON 数据解析脚本
============================
从桌面 chuan 文件夹读取所有 Charles 保存的 JSON 数据，
解析商品、分类信息，下载图片到本地，生成 products.ts

使用方法：
    python scripts/parse_local_data.py
"""

import json
import os
import re
import shutil
import urllib.request
import ssl
from pathlib import Path
from typing import Any

# ===== 配置 =====
CHUAN_DIR = Path(r"C:\Users\Administrator\Desktop\chuan")
ECOMMERCE_DIR = Path(r"C:\Users\Administrator\Desktop\ecommerce")
PRODUCTS_TS_PATH = ECOMMERCE_DIR / "src" / "data" / "products.ts"
IMAGES_DIR = ECOMMERCE_DIR / "public" / "images" / "products"

# 分类映射：categoryCode -> (category_id, category_name)
# 使用两级分类：父分类（5个大类）+ 子分类（小吃/调味品细分）
CATEGORY_MAP: dict[str, tuple[str, str]] = {
    # 酒类 - 保持不变
    "11":  ("wine",       "酒类"),
    "1101":("wine",       "酒类"),
    "1102":("wine",       "酒类"),
    "1104":("wine",       "酒类"),
    # 茗茶 - 保持不变
    "12":  ("tea",        "茗茶"),
    "1201":("tea",        "茗茶"),
    "1202":("tea",        "茗茶"),
    "1203":("tea",        "茗茶"),
    "1204":("tea",        "茗茶"),
    "1205":("tea",        "茗茶"),
    "1206":("tea",        "茗茶"),
    # 特色小吃 - 拆分为3个子分类
    "13":  ("snack",      "特色小吃"),
    "1301":("meat_snack", "肉类小吃"),
    "1302":("veggie_snack", "素食小吃"),
    "1303":("candy",      "糖果糕点"),
    # 调味品 - 拆分为3个子分类
    "14":  ("seasoning",  "调味品"),
    "1401":("table_seasoning", "佐餐调味"),
    "1402":("cooking_seasoning", "烹饪调味"),
    "1403":("dried_goods", "干货"),
    # 其他 - 保持不变
    "15":  ("other",      "其他"),
    "1501":("other",      "其他"),
    "1502":("other",      "其他"),
    "1503":("other",      "其他"),
}

# 父分类映射：2位code -> 父分类ID
PARENT_CATEGORY_MAP: dict[str, str] = {
    "11": "wine",
    "12": "tea",
    "13": "snack",
    "14": "seasoning",
    "15": "other",
}

# 默认规格（根据分类）
DEFAULT_SPECS: dict[str, list[dict[str, str]]] = {
    "wine":       [{"label": "净含量", "value": "500ml"}, {"label": "类型", "value": "酒类"}, {"label": "产地", "value": "四川"}],
    "baijiu":     [{"label": "净含量", "value": "500ml"}, {"label": "类型", "value": "白酒"}, {"label": "产地", "value": "四川"}],
    "red_wine":   [{"label": "净含量", "value": "750ml"}, {"label": "类型", "value": "红酒"}, {"label": "产地", "value": "四川"}],
    "other_wine": [{"label": "净含量", "value": "500ml"}, {"label": "类型", "value": "其他酒类"}, {"label": "产地", "value": "四川"}],
    "tea":        [{"label": "净含量", "value": "250g"}, {"label": "类型", "value": "茗茶"}, {"label": "产地", "value": "四川"}],
    "green_tea":      [{"label": "净含量", "value": "250g"}, {"label": "类型", "value": "绿茶"}, {"label": "产地", "value": "四川"}],
    "black_tea":      [{"label": "净含量", "value": "250g"}, {"label": "类型", "value": "红茶"}, {"label": "产地", "value": "四川"}],
    "flower_tea":     [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "花茶"}, {"label": "产地", "value": "四川"}],
    "buckwheat_tea":  [{"label": "净含量", "value": "500g"}, {"label": "类型", "value": "苦荞茶"}, {"label": "产地", "value": "四川"}],
    "tibetan_tea":    [{"label": "净含量", "value": "500g"}, {"label": "类型", "value": "藏茶"}, {"label": "产地", "value": "四川"}],
    "other_tea":      [{"label": "净含量", "value": "250g"}, {"label": "类型", "value": "茶叶"}, {"label": "产地", "value": "四川"}],
    "snack":      [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "特色小吃"}, {"label": "产地", "value": "四川"}],
    "meat_snack":   [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "肉类小吃"}, {"label": "产地", "value": "四川"}],
    "veggie_snack": [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "素食小吃"}, {"label": "产地", "value": "四川"}],
    "candy":        [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "糖果糕点"}, {"label": "产地", "value": "四川"}],
    "seasoning":  [{"label": "净含量", "value": "500g"}, {"label": "类型", "value": "调味品"}, {"label": "产地", "value": "四川"}],
    "table_seasoning":   [{"label": "净含量", "value": "300g"}, {"label": "类型", "value": "佐餐调味"}, {"label": "产地", "value": "四川"}],
    "cooking_seasoning": [{"label": "净含量", "value": "500g"}, {"label": "类型", "value": "烹饪调味"}, {"label": "产地", "value": "四川"}],
    "dried_goods":       [{"label": "净含量", "value": "250g"}, {"label": "类型", "value": "干货"}, {"label": "产地", "value": "四川"}],
    "other":      [{"label": "类型", "value": "其他"}, {"label": "产地", "value": "四川"}],
    "other_food":    [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "食品"}, {"label": "产地", "value": "四川"}],
    "general_goods": [{"label": "类型", "value": "百货"}, {"label": "产地", "value": "四川"}],
    "tea_set":       [{"label": "类型", "value": "茶具"}, {"label": "产地", "value": "四川"}],
}

# 已下载图片的映射：imgUrl -> 本地文件名
downloaded_images: dict[str, str] = {}


def extract_category_code_from_filename(filename: str) -> str | None:
    """从文件名中提取 categoryCode 参数值
    文件名格式: list%3fpageIndex%3d1%26...%26categoryCode%3d11%26...
    %3d = '=', %26 = '&'
    """
    # 先尝试 URL 编码格式: categoryCode%3d11
    m = re.search(r'categoryCode%3d(\d+)', filename)
    if m:
        return m.group(1)
    # 再尝试普通格式
    m = re.search(r'categoryCode=(\d+)', filename)
    if m:
        return m.group(1)
    return None


def extract_page_index_from_filename(filename: str) -> int:
    """从文件名中提取 pageIndex 参数值"""
    m = re.search(r'pageIndex=(\d+)', filename)
    if m:
        return int(m.group(1))
    return 1


def read_json_files(directory: Path) -> list[dict[str, Any]]:
    """读取目录下所有 JSON 文件并解析"""
    results = []
    if not directory.exists():
        print(f"  目录不存在: {directory}")
        return results

    for f in sorted(directory.iterdir()):
        if f.is_file() and f.stat().st_size > 0:
            try:
                with open(f, 'r', encoding='utf-8') as fh:
                    data = json.load(fh)
                    results.append({
                        "filename": f.name,
                        "data": data,
                        "categoryCode": extract_category_code_from_filename(f.name),
                        "pageIndex": extract_page_index_from_filename(f.name),
                    })
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                print(f"  跳过文件 {f.name}: {e}")
    return results


def download_image(url: str, product_id: str) -> str | None:
    """
    下载图片到本地 public/images/products/ 目录
    返回本地路径（相对于 public/）
    """
    if not url or url == "null":
        return None

    # 检查是否已下载
    if url in downloaded_images:
        return downloaded_images[url]

    # 从 URL 中提取文件夹名
    # URL 格式: https://cmt201910.oss-cn-zhangjiakou.aliyuncs.com//10101074/1.jpg?random
    m = re.search(r'/(\d+)/1\.jpg', url)
    folder = m.group(1) if m else product_id

    filename = f"{folder}.jpg"
    local_path = IMAGES_DIR / filename

    # 如果文件已存在，直接返回
    if local_path.exists():
        result = f"/images/products/{filename}"
        downloaded_images[url] = result
        return result

    try:
        print(f"  下载图片: {url[:60]}...")
        # 创建 SSL 上下文（不验证证书）
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        )
        with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
            IMAGES_DIR.mkdir(parents=True, exist_ok=True)
            with open(local_path, 'wb') as f:
                shutil.copyfileobj(response, f)

        result = f"/images/products/{filename}"
        downloaded_images[url] = result
        print(f"  OK: {filename}")
        return result
    except Exception as e:
        print(f"  FAIL {url[:60]}: {e}")
        return None


def download_all_images(url: str, product_id: str) -> list[str]:
    """
    下载商品的所有详情图片（1.jpg, 2.jpg, 3.jpg...）
    保存为 {folder_id}_1.jpg, {folder_id}_2.jpg, ...
    返回本地路径列表（相对于 public/）
    """
    if not url or url == "null":
        return []

    # 从 URL 中提取文件夹名
    # URL 格式: https://cmt201910.oss-cn-zhangjiakou.aliyuncs.com//10101074/1.jpg?random
    m = re.search(r'/(\d+)/1\.jpg', url)
    if not m:
        return []
    folder = m.group(1)

    local_images: list[str] = []
    n = 1
    while True:
        # 构造第 N 张图的 URL（去掉查询参数）
        base_url = url.split('?')[0] if '?' in url else url
        img_url = re.sub(r'/(\d+)/1\.jpg', f'/\\1/{n}.jpg', base_url)

        filename = f"{folder}_{n}.jpg"
        local_path = IMAGES_DIR / filename

        # 如果已存在，直接添加
        if local_path.exists():
            local_images.append(f"/images/products/{filename}")
            n += 1
            continue

        # 尝试下载
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(
                img_url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            )
            with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
                IMAGES_DIR.mkdir(parents=True, exist_ok=True)
                with open(local_path, 'wb') as f:
                    shutil.copyfileobj(response, f)
                local_images.append(f"/images/products/{filename}")
                print(f"  OK: {filename}")
                n += 1
        except urllib.error.HTTPError as e:
            if e.code == 404:
                break  # 没有更多图片了
            else:
                print(f"  HTTP {e.code}: {img_url[:60]}")
                break
        except Exception as e:
            print(f"  FAIL {img_url[:60]}: {e}")
            break

    return local_images


def download_description_image(url: str, product_id: str) -> str | None:
    """
    下载商品介绍长图（sm_1.jpg）
    URL 格式: https://cmt201910.oss-cn-zhangjiakou.aliyuncs.com//{folder_id}/sm_1.jpg
    保存为 {folder_id}_sm.jpg
    返回本地路径（相对于 public/），如果不存在则返回 None
    """
    if not url or url == "null":
        return None

    # 从 URL 中提取文件夹名
    m = re.search(r'/(\d+)/1\.jpg', url)
    if not m:
        return None
    folder = m.group(1)

    # 构造 sm_1.jpg 的 URL
    base_url = url.split('?')[0] if '?' in url else url
    sm_url = re.sub(r'/(\d+)/1\.jpg', f'/\\1/sm_1.jpg', base_url)

    filename = f"{folder}_sm.jpg"
    local_path = IMAGES_DIR / filename

    # 如果已存在，直接返回
    if local_path.exists():
        print(f"  OK (cached): {filename}")
        return f"/images/products/{filename}"

    # 尝试下载
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(
            sm_url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf2541923) XWEB/19823',
                'Referer': 'https://servicewechat.com/wx8c9e5abb1783164f/44/page-frame.html'
            }
        )
        with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
            IMAGES_DIR.mkdir(parents=True, exist_ok=True)
            with open(local_path, 'wb') as f:
                shutil.copyfileobj(response, f)
            print(f"  OK: {filename} ({response.length or '?'} bytes)")
            return f"/images/products/{filename}"
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"  sm_1.jpg not found for folder {folder}")
        else:
            print(f"  HTTP {e.code}: {sm_url[:60]}")
        return None
    except Exception as e:
        print(f"  FAIL {sm_url[:60]}: {e}")
        return None


# 分类描述模板（根据分类生成丰富的商品描述）
CATEGORY_DESC_TEMPLATES: dict[str, list[str]] = {
    "baijiu": [
        "精选四川优质高粱，传承古法酿造工艺，酒体醇厚，入口绵柔，回味悠长。",
        "四川白酒以其独特的窖香闻名，这款酒经过多年陈酿，香气浓郁，口感丰富。",
        "源自四川名酒产区，采用传统固态发酵工艺，酒花细腻，挂杯持久。",
    ],
    "red_wine": [
        "选用四川高原优质葡萄，经专业酿酒师精心酿造，果香浓郁，单宁柔顺。",
        "四川高原产区红酒，色泽宝石红，散发着成熟浆果的芬芳，口感圆润。",
        "融合四川独特风土的红酒，经过橡木桶陈酿，层次丰富，余韵悠长。",
    ],
    "other_wine": [
        "精选四川特色原料酿制，口感独特，是聚会宴请的佳品。",
        "传承四川传统酿酒技艺，每一滴都蕴含着巴蜀大地的精华。",
    ],
    "green_tea": [
        "采摘四川高山茶园嫩芽，色泽翠绿，汤色清亮，栗香浓郁，回甘持久。",
        "四川高山绿茶，手工采摘一芽一叶，外形扁平挺直，冲泡后香气四溢。",
        "源自四川云雾高山茶园，茶多酚含量丰富，滋味鲜爽，是健康之选。",
    ],
    "black_tea": [
        "四川高山红茶，条索紧结，色泽乌润，汤色红艳明亮，滋味醇厚甘甜。",
        "精选四川优质茶青，经传统红茶工艺精制而成，蜜香浓郁，口感顺滑。",
    ],
    "flower_tea": [
        "选用四川新鲜花朵与优质茶坯窨制而成，花香馥郁，茶味清雅，令人心旷神怡。",
        "四川花茶，将花的芬芳与茶的醇美完美融合，每一口都是自然的馈赠。",
    ],
    "buckwheat_tea": [
        "精选四川大凉山苦荞麦，经传统工艺烘焙而成，麦香浓郁，口感醇厚。",
        "四川苦荞茶，富含芦丁和膳食纤维，是健康养生的理想选择。",
    ],
    "tibetan_tea": [
        "源自四川藏区高原，采用传统藏茶工艺制作，茶汤红浓明亮，滋味醇和。",
        "四川藏茶，经过特殊发酵工艺，具有独特的陈香，是高原人民的智慧结晶。",
    ],
    "other_tea": [
        "精选四川优质茶叶，传统工艺制作，香气纯正，滋味醇和。",
        "四川特色茶叶，源自优质茶区，每一片茶叶都承载着巴蜀茶文化的精髓。",
    ],
    "meat_snack": [
        "精选四川优质肉类，配以传统秘制香料，经多道工序精心制作，麻辣鲜香，回味无穷。",
        "四川传统肉类小吃，选用上等原料，搭配地道川味调料，口感丰富，越嚼越香。",
        "正宗四川风味肉类零食，肉质紧实有嚼劲，麻辣适中，是佐餐下酒的绝佳选择。",
    ],
    "veggie_snack": [
        "精选四川新鲜蔬菜，采用传统工艺制作，保留了食材的原汁原味，健康美味。",
        "四川特色素食小吃，口感丰富，味道鲜美，是素食爱好者的不二之选。",
    ],
    "candy": [
        "四川传统糕点糖果，选用优质原料，手工制作，甜而不腻，老少皆宜。",
        "融合四川特色的精美糕点，造型别致，口感细腻，是茶余饭后的甜蜜享受。",
    ],
    "table_seasoning": [
        "四川传统佐餐调味品，选用优质原料精心调配，开胃下饭，是餐桌上的必备佳品。",
        "地道四川佐餐酱料，麻辣鲜香，拌饭拌面皆宜，让您在家也能享受正宗川味。",
    ],
    "cooking_seasoning": [
        "四川烹饪调味料，精选上等辣椒、花椒等原料，传承古法配方，让您轻松做出地道川菜。",
        "正宗川菜调味料，严格配比，一料多用，无论是红烧、爆炒还是炖煮，都能完美驾驭。",
    ],
    "dried_goods": [
        "精选四川优质干货，自然晾晒，保留了食材的天然营养和鲜美味道。",
        "四川传统干货，品质上乘，易于保存，是煲汤炖菜的理想食材。",
    ],
    "other_food": [
        "四川特色食品，精选优质原料，传统工艺制作，味道正宗，值得品尝。",
        "来自四川的美味食品，每一口都能感受到巴蜀大地的独特风情。",
    ],
    "general_goods": [
        "精选四川特色百货，品质优良，设计精美，是日常生活的好帮手。",
        "四川特色商品，融合传统与现代，实用与美观兼具。",
    ],
    "tea_set": [
        "精美茶具套装，设计典雅，工艺精湛，是品茶论道的理想之选。",
        "四川特色茶具，融合传统工艺与现代美学，让每一次泡茶都成为享受。",
    ],
    "other": [
        "精选四川特色商品，品质优良，值得拥有。",
        "来自四川的正宗特产，每一件都承载着巴蜀文化的独特魅力。",
    ],
}


def generate_description(name: str, cat_id: str, delivery: str, sales: int) -> str:
    """根据商品名称、分类和销量生成丰富的描述"""
    templates = CATEGORY_DESC_TEMPLATES.get(cat_id, CATEGORY_DESC_TEMPLATES["other"])
    # 根据销量选择不同的描述模板
    if sales > 50:
        template = templates[0] if len(templates) > 0 else templates[-1]
    elif sales > 10:
        template = templates[1] if len(templates) > 1 else templates[0]
    else:
        template = templates[-1]

    delivery_text = ""
    if delivery:
        delivery_text = f"支持{delivery}。"
    
    return f"{name}，{template}{delivery_text}川名堂上地华联店精选四川地道特产，品质保证，让您足不出户品味巴蜀风情。"


def parse_product(item: dict[str, Any], category_code: str) -> dict[str, Any] | None:
    """解析单个商品数据"""
    product_id = str(item.get("productId") or item.get("id") or "")
    if not product_id:
        return None

    name = item.get("productName") or ""
    if not name:
        return None

    price_str = item.get("price") or "0"
    try:
        price = float(price_str)
    except ValueError:
        price = 0.0

    price1_str = item.get("price1") or "0"
    try:
        price1 = float(price1_str)
    except ValueError:
        price1 = 0.0

    # 确定分类
    cat_id, cat_name = CATEGORY_MAP.get(category_code, ("other", "其他"))

    # 确定父分类（取 category_code 前2位）
    parent_code = category_code[:2] if len(category_code) >= 2 else category_code
    parent_category = PARENT_CATEGORY_MAP.get(parent_code, "other")

    # 下载图片
    img_url = item.get("imgUrl") or ""
    local_image = download_image(img_url, product_id) if img_url else None

    # 下载所有详情图片（1.jpg, 2.jpg, 3.jpg...）
    local_images = download_all_images(img_url, product_id) if img_url else []

    # 下载商品介绍长图（sm_1.jpg）
    local_description_image = download_description_image(img_url, product_id) if img_url else None

    # 确定 badge
    badge = None
    if item.get("isBigSale") == True:
        badge = "特惠"
    elif item.get("isHotSale") == True:
        badge = "热销"

    # 月销量
    month_sale = item.get("monthSale") or "0"
    try:
        sales = int(month_sale)
    except ValueError:
        sales = 0

    # 配送方式
    delivery = item.get("deliveryType") or ""

    # 生成丰富的描述
    description = generate_description(name, cat_id, delivery, sales)

    # 规格
    specs = DEFAULT_SPECS.get(cat_id, DEFAULT_SPECS["other"])

    # 原价
    original_price = None
    if price1 > price:
        original_price = price1

    return {
        "id": product_id,
        "name": name,
        "category": cat_id,
        "subcategory": cat_name,
        "parentCategory": parent_category,
        "price": price,
        "originalPrice": original_price,
        "image": local_image or "/images/products/placeholder.jpg",
        "images": local_images if local_images else None,
        "descriptionImage": local_description_image,
        "description": description,
        "specs": specs,
        "badge": badge,
        "sales": sales,
    }


# 分类详细描述（父分类 + 子分类）
CATEGORY_DESCRIPTIONS: dict[str, str] = {
    "wine": "四川名酒荟萃，传承千年酿造工艺，每一滴都是时间的馈赠",
    "tea": "来自四川高山茶园的优质茶叶，色泽翠绿，香气清幽，品味大自然的馈赠",
    "snack": "四川特色小吃，麻辣鲜香，回味无穷，每一口都是巴蜀风情的呈现",
    "meat_snack": "精选四川地道肉类小吃，麻辣鲜香，越嚼越有味",
    "veggie_snack": "四川传统素食小吃，清爽可口，素食爱好者的美味之选",
    "candy": "四川特色糖果糕点，甜而不腻，传统工艺与现代口感的完美结合",
    "seasoning": "正宗川菜调味料，精选上等原料，让您轻松做出地道四川美味",
    "table_seasoning": "佐餐调味佳品，开胃下饭，为日常餐桌增添川味风情",
    "cooking_seasoning": "烹饪调味料，地道川味配方，让您在家也能做出正宗川菜",
    "dried_goods": "四川特色干货，天然晾晒，保留食材本真味道",
    "other": "四川特色商品，品质优良，融合传统与现代，实用与美观兼具",
}


def parse_category_data(cat: dict[str, Any]) -> dict[str, Any] | None:
    """解析分类数据"""
    code = cat.get("code", "")
    name = cat.get("name", "")
    img = cat.get("img", "")

    if not code or not name:
        return None

    # 跳过"全部"分类（code 为 11, 12, 13, 14, 15 等两位数的顶级分类）
    if len(code) <= 2 and name == "全部":
        return None

    cat_id, cat_name = CATEGORY_MAP.get(code, ("", ""))
    if not cat_id:
        return None

    # 使用 emoji 作为图标
    emoji_map = {
        "baijiu": "🍶",
        "red_wine": "🍷",
        "other_wine": "🍸",
        "tea": "🍵",
        "green_tea": "🍵",
        "black_tea": "🍵",
        "flower_tea": "🌺",
        "buckwheat_tea": "🌾",
        "tibetan_tea": "🍵",
        "other_tea": "🍵",
        "snack": "🥟",
        "meat_snack": "🥩",
        "veggie_snack": "🥬",
        "candy": "🍬",
        "seasoning": "🌶️",
        "table_seasoning": "🧂",
        "cooking_seasoning": "🍳",
        "dried_goods": "🥜",
        "other": "📦",
        "other_food": "🍱",
        "general_goods": "🧴",
        "tea_set": "🫖",
    }
    icon = emoji_map.get(cat_id, "🛍️")
    
    # 使用详细描述
    desc = CATEGORY_DESCRIPTIONS.get(cat_id, f"正宗四川{cat_name}")

    return {
        "id": cat_id,
        "name": cat_name,  # 使用 CATEGORY_MAP 中的中文名，而非 JSON 中的子分类名
        "icon": icon,
        "description": desc,
    }


def generate_products_ts(products: list[dict[str, Any]], categories: list[dict[str, Any]]) -> str:
    """生成 products.ts 文件内容"""
    from datetime import datetime

    lines = []
    lines.append('// ============================================================')
    lines.append('// 川名堂上地华联店 - 商品数据')
    lines.append('// 由 scripts/parse_local_data.py 自动生成')
    lines.append(f'// 生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    lines.append(f'// 商品总数: {len(products)}')
    lines.append('// ============================================================')
    lines.append('')
    lines.append('export interface Product {')
    lines.append('  id: string;')
    lines.append('  name: string;')
    lines.append('  category: string;')
    lines.append('  subcategory: string;')
    lines.append('  parentCategory: string;')
    lines.append('  price: number;')
    lines.append('  originalPrice?: number;')
    lines.append('  image: string;')
    lines.append('  images?: string[];')
    lines.append('  descriptionImage?: string;')
    lines.append('  description: string;')
    lines.append('  specs: { label: string; value: string }[];')
    lines.append('  badge?: string;')
    lines.append('  sales?: number;')
    lines.append('}')
    lines.append('')
    lines.append('export interface Category {')
    lines.append('  id: string;')
    lines.append('  name: string;')
    lines.append('  icon: string;')
    lines.append('  description: string;')
    lines.append('}')
    lines.append('')

    # 生成 categories - 只输出5个父分类（与川名堂小程序一致）
    # 父分类ID列表
    parent_ids = {"wine", "tea", "snack", "seasoning", "other"}
    parent_categories = [c for c in categories if c["id"] in parent_ids]
    # 按指定顺序排列
    parent_order = ["wine", "tea", "snack", "seasoning", "other"]
    parent_categories.sort(key=lambda c: parent_order.index(c["id"]) if c["id"] in parent_order else 99)

    lines.append('export const categories: Category[] = [')
    for i, cat in enumerate(parent_categories):
        comma = "," if i < len(parent_categories) - 1 else ""
        lines.append('  {')
        lines.append(f'    id: "{cat["id"]}",')
        lines.append(f'    name: "{cat["name"]}",')
        lines.append(f'    icon: "{cat["icon"]}",')
        lines.append(f'    description: "{cat["description"]}",')
        lines.append(f'  }}{comma}')
    lines.append('];')
    lines.append('')

    # 生成 products
    lines.append('export const products: Product[] = [')

    # 按5个父大类分组
    cat_order = ["wine", "tea", "snack", "seasoning", "other"]

    # 先按父分类分组
    cat_groups: dict[str, list[dict]] = {}
    for p in products:
        parent = p.get("parentCategory", p["category"])
        cat_groups.setdefault(parent, []).append(p)

    first_product = True
    for cat_id in cat_order:
        if cat_id not in cat_groups:
            continue
        group = cat_groups[cat_id]
        # 取父分类的中文名（从第一个商品获取）
        parent_name_map = {
            "wine": "酒类", "tea": "茗茶", "snack": "特色小吃",
            "seasoning": "调味品", "other": "其他"
        }
        cat_name = parent_name_map.get(cat_id, cat_id)

        if not first_product:
            lines.append('')
        first_product = False
        lines.append(f'  // ---- {cat_name} ----')

        for p in group:
            lines.append('  {')
            lines.append(f'    id: "{p["id"]}",')
            # 转义名称中的反斜杠和双引号
            safe_name = p["name"].replace('\\', '\\\\').replace('"', '\\"')
            lines.append(f'    name: "{safe_name}",')
            lines.append(f'    category: "{p["category"]}",')
            lines.append(f'    subcategory: "{p["subcategory"]}",')
            lines.append(f'    parentCategory: "{p["parentCategory"]}",')
            lines.append(f'    price: {p["price"]},')
            if p["originalPrice"] is not None:
                lines.append(f'    originalPrice: {p["originalPrice"]},')
            lines.append(f'    image: "{p["image"]}",')
            if p.get("images"):
                images_str = ", ".join(f'"{img}"' for img in p["images"])
                lines.append(f'    images: [{images_str}],')
            if p.get("descriptionImage"):
                lines.append(f'    descriptionImage: "{p["descriptionImage"]}",')
            safe_desc = p["description"].replace('\\', '\\\\').replace('"', '\\"')
            lines.append(f'    description: "{safe_desc}",')
            lines.append('    specs: [')
            for si, spec in enumerate(p["specs"]):
                scomma = "," if si < len(p["specs"]) - 1 else ""
                safe_label = spec["label"].replace('\\', '\\\\').replace('"', '\\"')
                safe_value = spec["value"].replace('\\', '\\\\').replace('"', '\\"')
                lines.append(f'      {{ label: "{safe_label}", value: "{safe_value}" }}{scomma}')
            lines.append('    ],')
            if p["badge"]:
                lines.append(f'    badge: "{p["badge"]}",')
            if p["sales"] and p["sales"] > 0:
                lines.append(f'    sales: {p["sales"]},')
            lines.append('  },')

    lines.append('];')
    lines.append('')

    # 辅助函数 - 推荐商品（取销量最高的前16个，或带badge的商品）
    lines.append('// 推荐商品：优先取带badge的商品，不足则按销量排序补充')
    lines.append('export const featuredProducts: Product[] = (() => {')
    lines.append('  const badgeProducts = products.filter((p) => p.badge === "热销" || p.badge === "特惠");')
    lines.append('  if (badgeProducts.length >= 8) return badgeProducts.slice(0, 16);')
    lines.append('  const seen = new Set(badgeProducts.map((p) => p.id));')
    lines.append('  const sorted = [...products].filter((p) => !seen.has(p.id)).sort((a, b) => (b.sales || 0) - (a.sales || 0));')
    lines.append('  return [...badgeProducts, ...sorted].slice(0, 16);')
    lines.append('})();')
    lines.append('// 新品推荐：取前12个商品')
    lines.append('export const newProducts = products.slice(0, 12);')
    lines.append('')
    lines.append('export function getProductById(id: string): Product | undefined {')
    lines.append('  return products.find((p) => p.id === id);')
    lines.append('}')
    lines.append('')
    lines.append('export function getProductsByCategory(category: string): Product[] {')
    lines.append('  return products.filter((p) => p.category === category);')
    lines.append('}')
    lines.append('')
    lines.append('export function getCategoryById(id: string): Category | undefined {')
    lines.append('  return categories.find((c) => c.id === id);')
    lines.append('}')

    return '\n'.join(lines)


def main():
    import sys
    import io
    # 设置 stdout 为 UTF-8
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("=" * 60)
    print("川名堂本地 JSON 数据解析脚本")
    print("=" * 60)

    # 确保图片目录存在
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    # 1. 读取分类/品牌数据
    print("\n[1/6] 读取分类/品牌数据...")
    category_dir = CHUAN_DIR / "e.chuanmingtang.cn" / "o2o" / "wxmicroapp" / "member" / "categoryandbrand"
    cat_files = read_json_files(category_dir)
    print(f"  找到 {len(cat_files)} 个分类/品牌文件")

    # 2. 读取商品列表数据
    print("\n[2/6] 读取商品列表数据...")
    product_dir = CHUAN_DIR / "e.chuanmingtang.cn" / "o2o" / "wxmicroapp" / "member" / "product"
    prod_files = read_json_files(product_dir)
    print(f"  找到 {len(prod_files)} 个商品列表文件")

    # 3. 解析分类
    print("\n[3/6] 解析分类数据...")
    all_categories: dict[str, dict] = {}
    for cf in cat_files:
        data = cf["data"]
        category_list = data.get("data", {}).get("categoryList", [])
        for cat in category_list:
            parsed = parse_category_data(cat)
            if parsed:
                all_categories[parsed["id"]] = parsed

    # 也从商品文件中读取分类
    for pf in prod_files:
        data = pf["data"]
        category_list = data.get("data", {}).get("categoryList", [])
        for cat in category_list:
            parsed = parse_category_data(cat)
            if parsed:
                all_categories[parsed["id"]] = parsed

    # 确保5个父分类都存在（JSON中可能缺少"全部"分类被跳过）
    parent_fallback = {
        "wine": ("wine", "酒类", "🍶"),
        "tea": ("tea", "茗茶", "🍵"),
        "snack": ("snack", "特色小吃", "🥟"),
        "seasoning": ("seasoning", "调味品", "🌶️"),
        "other": ("other", "其他", "📦"),
    }
    for pid, (pname, plabel, picon) in parent_fallback.items():
        if pid not in all_categories:
            all_categories[pid] = {
                "id": pid,
                "name": plabel,
                "icon": picon,
                "description": CATEGORY_DESCRIPTIONS.get(pid, f"正宗四川{plabel}"),
            }

    categories = list(all_categories.values())
    print(f"  解析到 {len(categories)} 个分类")

    # 4. 解析商品
    print("\n[4/6] 解析商品数据...")
    all_products: list[dict] = []
    seen_ids: set[str] = set()

    for pf in prod_files:
        data = pf["data"]
        category_code = pf["categoryCode"]
        product_list = data.get("data", {}).get("productList", {})
        datas = product_list.get("datas", [])

        page_info = f"pageIndex={product_list.get('pageIndex', '?')}/{product_list.get('totalPage', '?')}"

        for item in datas:
            parsed = parse_product(item, category_code or "15")
            if parsed and parsed["id"] not in seen_ids:
                seen_ids.add(parsed["id"])
                all_products.append(parsed)

        total = product_list.get("totalCount", 0)
        print(f"  分类 {category_code} {page_info}: {len(datas)} 条 (总计 {total})")

    print(f"\n  共解析到 {len(all_products)} 个商品")

    # 5. 下载图片
    print("\n[5/6] 下载商品图片...")
    print(f"  已下载 {len(downloaded_images)} 张图片")

    # 6. 生成 products.ts
    print("\n[6/6] 生成 products.ts...")
    ts_content = generate_products_ts(all_products, categories)

    with open(PRODUCTS_TS_PATH, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    print(f"  已写入: {PRODUCTS_TS_PATH}")

    # 7. 统计
    print("\n" + "=" * 60)
    print("统计信息")
    print("=" * 60)
    print(f"  分类数: {len(categories)}")
    print(f"  商品数: {len(all_products)}")
    print(f"  图片数: {len(downloaded_images)}")

    # 按分类统计
    from collections import Counter
    cat_counter = Counter(p["subcategory"] for p in all_products)
    print("\n  按分类:")
    for cat_name, count in cat_counter.most_common():
        print(f"    {cat_name}: {count}")

    print("\n完成!")


if __name__ == "__main__":
    main()
