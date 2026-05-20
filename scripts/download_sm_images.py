# -*- coding: utf-8 -*-
"""
只下载商品介绍长图（sm_1.jpg），不重新下载已有图片。
然后重新生成 products.ts（包含 descriptionImage 字段）。
"""
import json
import os
import re
import shutil
import ssl
import urllib.request
from pathlib import Path

# 路径配置
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(r"C:\Users\Administrator\Desktop\chuan\e.chuanmingtang.cn\o2o\wxmicroapp\member\product")
IMAGES_DIR = BASE_DIR / "public" / "images" / "products"

# 分类映射（与 parse_local_data.py 保持一致）
CATEGORY_MAP: dict[str, tuple[str, str]] = {
    "01": ("baijiu", "白酒"), "02": ("red_wine", "红酒"), "03": ("beer", "啤酒"),
    "04": ("yellow_wine", "黄酒"), "05": ("foreign_wine", "洋酒"), "06": ("other_wine", "其他酒类"),
    "07": ("green_tea", "绿茶"), "08": ("black_tea", "红茶"), "09": ("dark_tea", "黑茶"),
    "10": ("other_tea", "其他茶叶"), "11": ("meat_snack", "肉类零食"), "12": ("veggie_snack", "素食零食"),
    "13": ("candy", "糖果糕点"), "14": ("table_seasoning", "佐餐调味品"),
    "15": ("cooking_seasoning", "烹饪调味料"), "16": ("dried_goods", "干货"),
    "17": ("other_food", "其他食品"), "18": ("general_goods", "日用百货"),
    "19": ("tea_set", "茶具"),
}

PARENT_CATEGORY_MAP: dict[str, str] = {
    "01": "wine", "02": "wine", "03": "wine", "04": "wine", "05": "wine", "06": "wine",
    "07": "tea", "08": "tea", "09": "tea", "10": "tea",
    "11": "snack", "12": "snack", "13": "snack",
    "14": "seasoning", "15": "seasoning", "16": "seasoning", "17": "seasoning",
    "18": "other", "19": "other",
}

DEFAULT_SPECS: dict[str, list[dict[str, str]]] = {
    "baijiu": [{"label": "净含量", "value": "500ml"}, {"label": "类型", "value": "酒类"}, {"label": "产地", "value": "四川"}],
    "red_wine": [{"label": "净含量", "value": "750ml"}, {"label": "类型", "value": "酒类"}, {"label": "产地", "value": "四川"}],
    "beer": [{"label": "净含量", "value": "500ml"}, {"label": "类型", "value": "酒类"}, {"label": "产地", "value": "四川"}],
    "yellow_wine": [{"label": "净含量", "value": "500ml"}, {"label": "类型", "value": "酒类"}, {"label": "产地", "value": "四川"}],
    "foreign_wine": [{"label": "净含量", "value": "750ml"}, {"label": "类型", "value": "酒类"}, {"label": "产地", "value": "四川"}],
    "other_wine": [{"label": "净含量", "value": "500ml"}, {"label": "类型", "value": "酒类"}, {"label": "产地", "value": "四川"}],
    "green_tea": [{"label": "净含量", "value": "250g"}, {"label": "类型", "value": "茶叶"}, {"label": "产地", "value": "四川"}],
    "black_tea": [{"label": "净含量", "value": "250g"}, {"label": "类型", "value": "茶叶"}, {"label": "产地", "value": "四川"}],
    "dark_tea": [{"label": "净含量", "value": "250g"}, {"label": "类型", "value": "茶叶"}, {"label": "产地", "value": "四川"}],
    "other_tea": [{"label": "净含量", "value": "250g"}, {"label": "类型", "value": "茶叶"}, {"label": "产地", "value": "四川"}],
    "meat_snack": [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "零食"}, {"label": "产地", "value": "四川"}],
    "veggie_snack": [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "零食"}, {"label": "产地", "value": "四川"}],
    "candy": [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "糕点"}, {"label": "产地", "value": "四川"}],
    "table_seasoning": [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "调味品"}, {"label": "产地", "value": "四川"}],
    "cooking_seasoning": [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "调味品"}, {"label": "产地", "value": "四川"}],
    "dried_goods": [{"label": "净含量", "value": "250g"}, {"label": "类型", "value": "干货"}, {"label": "产地", "value": "四川"}],
    "other_food": [{"label": "净含量", "value": "200g"}, {"label": "类型", "value": "食品"}, {"label": "产地", "value": "四川"}],
    "general_goods": [{"label": "规格", "value": "标准"}, {"label": "类型", "value": "百货"}, {"label": "产地", "value": "四川"}],
    "tea_set": [{"label": "规格", "value": "标准"}, {"label": "类型", "value": "茶具"}, {"label": "产地", "value": "四川"}],
    "other": [{"label": "规格", "value": "标准"}, {"label": "类型", "value": "其他"}, {"label": "产地", "value": "四川"}],
}


def extract_category_code_from_filename(filename: str) -> str | None:
    # 匹配 pageIndex=...&categoryCode=XXX 或 categoryCode=XXX
    m = re.search(r'categoryCode%3[dD]([a-zA-Z0-9]+)', filename)
    if m:
        return m.group(1)
    return None


def read_json_files(directory: Path) -> list[dict]:
    """读取所有 JSON 数据文件，返回带文件名和分类代码的信息"""
    all_data = []
    if not directory.exists():
        print(f"目录不存在: {directory}")
        return all_data
    for f in sorted(directory.iterdir()):
        if f.is_file() and not f.name.startswith('.'):
            try:
                with open(f, 'r', encoding='utf-8') as fh:
                    data = json.load(fh)
                category_code = extract_category_code_from_filename(f.name)
                all_data.append({
                    "filename": f.name,
                    "data": data,
                    "categoryCode": category_code,
                })
            except Exception as e:
                print(f"  跳过 {f.name}: {e}")
    print(f"读取了 {len(all_data)} 个数据文件")
    return all_data


def download_description_image(url: str, product_id: str) -> str | None:
    """下载商品介绍长图 sm_1.jpg，保存为 {folder_id}_sm.jpg"""
    if not url or url == "null":
        return None
    m = re.search(r'/(\d+)/1\.jpg', url)
    if not m:
        return None
    folder = m.group(1)

    base_url = url.split('?')[0] if '?' in url else url
    sm_url = re.sub(r'/(\d+)/1\.jpg', f'/\\1/sm_1.jpg', base_url)

    filename = f"{folder}_sm.jpg"
    local_path = IMAGES_DIR / filename

    if local_path.exists():
        print(f"  OK (cached): {filename}")
        return f"/images/products/{filename}"

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


def generate_description(name: str, cat_id: str, delivery: str, sales: int) -> str:
    """生成商品描述（与 parse_local_data.py 保持一致）"""
    templates = {
        "baijiu": ["精选四川优质高粱，传承古法酿造工艺，酒体醇厚，入口绵柔，回味悠长。"],
        "red_wine": ["精选四川优质葡萄，采用传统酿造工艺，酒体饱满，果香浓郁。"],
        "beer": ["精选优质麦芽和啤酒花，泡沫细腻，口感清爽。"],
        "yellow_wine": ["传承古法酿造工艺，酒体醇厚，香气浓郁。"],
        "foreign_wine": ["精选进口优质葡萄，经过精心酿造，口感丰富。"],
        "other_wine": ["精选四川优质原料，传统工艺酿造，口感独特。"],
        "green_tea": ["精选四川高山绿茶，色泽翠绿，香气清幽，滋味鲜爽。"],
        "black_tea": ["精选四川优质红茶，汤色红艳，香气浓郁，滋味醇厚。"],
        "dark_tea": ["四川藏茶，经过特殊发酵工艺，具有独特的陈香。"],
        "other_tea": ["精选四川优质茶叶，传统工艺制作，香气纯正，滋味醇和。"],
        "meat_snack": ["精选四川优质肉类，配以传统秘制香料，麻辣鲜香，回味无穷。"],
        "veggie_snack": ["精选四川新鲜蔬菜，采用传统工艺制作，保留了食材的原汁原味。"],
        "candy": ["四川传统糕点糖果，选用优质原料，手工制作，甜而不腻。"],
        "table_seasoning": ["四川传统佐餐调味品，选用优质原料精心调配，开胃下饭。"],
        "cooking_seasoning": ["四川烹饪调味料，精选上等辣椒、花椒等原料，传承古法配方。"],
        "dried_goods": ["精选四川优质干货，自然晾晒，保留了食材的天然营养和鲜美味道。"],
        "other_food": ["四川特色食品，精选优质原料，传统工艺制作，味道正宗。"],
        "general_goods": ["精选四川特色百货，品质优良，设计精美。"],
        "tea_set": ["精美茶具套装，设计典雅，工艺精湛。"],
        "other": ["精选四川特色商品，品质优良，值得拥有。"],
    }
    tpls = templates.get(cat_id, templates["other"])
    template = tpls[0]
    delivery_text = f"支持{delivery}。" if delivery else ""
    return f"{name}，{template}{delivery_text}川名堂上地华联店精选四川地道特产，品质保证，让您足不出户品味巴蜀风情。"


def parse_product(item: dict, category_code: str) -> dict | None:
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

    cat_id, cat_name = CATEGORY_MAP.get(category_code, ("other", "其他"))
    parent_code = category_code[:2] if len(category_code) >= 2 else category_code
    parent_category = PARENT_CATEGORY_MAP.get(parent_code, "other")

    img_url = item.get("imgUrl") or ""

    # 只下载 sm_1.jpg，其他图片已存在
    local_description_image = download_description_image(img_url, product_id) if img_url else None

    # 从已下载的图片中构建 images 列表
    local_images = []
    if img_url:
        m = re.search(r'/(\d+)/1\.jpg', img_url)
        if m:
            folder = m.group(1)
            n = 1
            while True:
                img_path = IMAGES_DIR / f"{folder}_{n}.jpg"
                if img_path.exists():
                    local_images.append(f"/images/products/{folder}_{n}.jpg")
                    n += 1
                else:
                    break

    badge = None
    if item.get("isBigSale") == True:
        badge = "特惠"
    elif item.get("isHotSale") == True:
        badge = "热销"

    month_sale = item.get("monthSale") or "0"
    try:
        sales = int(month_sale)
    except ValueError:
        sales = 0

    delivery = item.get("deliveryType") or ""
    description = generate_description(name, cat_id, delivery, sales)
    specs = DEFAULT_SPECS.get(cat_id, DEFAULT_SPECS["other"])

    original_price = None
    if price1 > price:
        original_price = price1

    # 从已有 products.ts 中读取 image 字段（避免重新下载主图）
    # 直接使用已存在的 {folder_id}.jpg
    local_image = None
    if img_url:
        m = re.search(r'/(\d+)/1\.jpg', img_url)
        if m:
            folder = m.group(1)
            main_img = IMAGES_DIR / f"{folder}.jpg"
            if main_img.exists():
                local_image = f"/images/products/{folder}.jpg"

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


def generate_products_ts(products: list[dict], categories: list[dict]) -> str:
    """生成 products.ts 文件内容"""
    from datetime import datetime

    lines = []
    lines.append('// ============================================================')
    lines.append('// 川名堂上地华联店 - 商品数据')
    lines.append('// 由 scripts/download_sm_images.py 自动生成')
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

    # 生成 categories
    parent_ids = {"wine", "tea", "snack", "seasoning", "other"}
    parent_categories = [c for c in categories if c["id"] in parent_ids]
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
    cat_order = ["wine", "tea", "snack", "seasoning", "other"]
    cat_groups: dict[str, list[dict]] = {}
    for p in products:
        parent = p.get("parentCategory", p["category"])
        cat_groups.setdefault(parent, []).append(p)

    first_product = True
    for cat_id in cat_order:
        if cat_id not in cat_groups:
            continue
        group = cat_groups[cat_id]
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

    lines.append('// 推荐商品：优先取带badge的商品，不足则按销量排序补充')
    lines.append('// 排除酒类和茶叶，展示亲民知名的零食和调味品')
    lines.append('export const featuredProducts: Product[] = (() => {')
    lines.append('  const badgeProducts = products.filter((p) => (p.badge === "热销" || p.badge === "特惠") && p.parentCategory !== "wine" && p.parentCategory !== "tea");')
    lines.append('  if (badgeProducts.length >= 8) return badgeProducts.slice(0, 16);')
    lines.append('  const seen = new Set(badgeProducts.map((p) => p.id));')
    lines.append('  const sorted = [...products].filter((p) => !seen.has(p.id) && p.parentCategory !== "wine" && p.parentCategory !== "tea").sort((a, b) => (b.sales || 0) - (a.sales || 0));')
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
    import re
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("=" * 60)
    print("只下载 sm_1.jpg 商品介绍长图 + 更新已有 products.ts 的 descriptionImage")
    print("=" * 60)

    # 1. 读取原始 JSON 数据
    print("\n[1/4] 读取原始数据...")
    all_data = read_json_files(DATA_DIR)
    if not all_data:
        print("错误：没有读取到任何数据文件")
        return

    # 2. 提取所有商品并下载 sm_1.jpg
    print("\n[2/4] 下载 sm_1.jpg 图片...")
    product_images: dict[str, str] = {}  # product_id -> descriptionImage path
    seen_product_ids: set[str] = set()

    for entry in all_data:
        data = entry.get("data", {})
        category_code = entry.get("categoryCode") or "00"
        try:
            product_list = data.get("data", {}).get("productList", {})
            items = product_list.get("datas", [])
        except Exception:
            continue

        for item in items:
            product_id = str(item.get("productId") or item.get("id") or "")
            if not product_id or product_id in seen_product_ids:
                continue
            seen_product_ids.add(product_id)

            parsed = parse_product(item, category_code)
            if parsed and parsed.get("descriptionImage"):
                product_images[parsed["id"]] = parsed["descriptionImage"]

    print(f"  共处理 {len(seen_product_ids)} 个商品")
    print(f"  有 sm_1.jpg 介绍图的商品: {len(product_images)}")

    # 3. 更新已有 products.ts 中的 descriptionImage 字段
    print("\n[3/4] 更新 products.ts 中的 descriptionImage...")
    output_path = BASE_DIR / "src" / "data" / "products.ts"
    if not output_path.exists():
        print(f"错误：{output_path} 不存在，请先运行 parse_local_data.py")
        return

    with open(output_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 对每个有 descriptionImage 的商品，在 products.ts 中找到对应行并更新
    update_count = 0
    for pid, img_path in product_images.items():
        # 匹配 product 块中的 id 行，然后在其后查找或添加 descriptionImage 行
        # 模式：匹配 "    id: \"{pid}\"," 然后查找后续的 descriptionImage 行
        id_pattern = f'    id: "{pid}",'
        if id_pattern not in content:
            continue

        # 找到 id 行的位置
        id_pos = content.find(id_pattern)
        # 从这个位置开始，找到当前 product 块的结束（下一个 "}," 或 "}" 或 "];"）
        block_end = content.find("  },", id_pos)
        if block_end == -1:
            block_end = content.find("\n];", id_pos)
        if block_end == -1:
            block_end = id_pos + 200  # 安全回退

        block = content[id_pos:block_end]

        # 检查是否已有 descriptionImage 行
        desc_pattern = re.compile(r'    descriptionImage: "[^"]*",?')
        existing_desc = desc_pattern.search(block)

        if existing_desc:
            # 更新已有的 descriptionImage 行
            old_line = existing_desc.group(0)
            new_line = f'    descriptionImage: "{img_path}",'
            # 只替换当前 block 中的这一行
            line_pos = content.find(old_line, id_pos)
            if line_pos != -1 and line_pos < block_end:
                content = content[:line_pos] + new_line + content[line_pos + len(old_line):]
                update_count += 1
        else:
            # 在 id 行之后插入 descriptionImage 行
            # 找到 id 行末尾的换行符
            id_line_end = content.find('\n', id_pos)
            if id_line_end != -1:
                insert_pos = id_line_end + 1
                indent = "    "
                content = content[:insert_pos] + f'{indent}descriptionImage: "{img_path}",\n' + content[insert_pos:]
                update_count += 1

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  更新了 {update_count} 个商品的 descriptionImage 字段")

    # 4. 统计
    print("\n[4/4] 统计...")
    sm_files = list(IMAGES_DIR.glob("*_sm.jpg"))
    print(f"  已下载 sm_1.jpg 文件数: {len(sm_files)}")

    print("\n完成！")


if __name__ == "__main__":
    main()
