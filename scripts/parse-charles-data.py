"""
Charles 抓包数据解析脚本
========================
使用方法：
1. 用 Charles 抓取川名堂小程序的数据
2. 在 Charles 中选中返回商品 JSON 的请求
3. 右键 -> Save Response... -> 保存为 response.json
4. 运行: python parse-charles-data.py response.json
5. 脚本会输出解析后的商品数据，可直接复制到 products.ts

如果抓到的数据格式不同，可以修改 parse_item() 函数中的字段映射。
"""

import json
import sys
import os
from typing import Any


def parse_item(item: dict[str, Any]) -> dict[str, Any] | None:
    """
    解析单个商品数据。
    根据实际抓到的 JSON 结构调整字段映射。
    """
    try:
        # ===== 根据实际 JSON 结构调整下面的字段名 =====
        # 常见字段名可能性：
        # 名称: name, title, productName, goodsName, itemName
        # 价格: price, salePrice, retailPrice, productPrice, minPrice
        # 原价: originalPrice, marketPrice, oldPrice, originalPrice
        # 图片: image, img, productImg, goodsImg, cover, thumb
        # 描述: description, desc, intro, summary, detail
        # ID: id, productId, goodsId, itemId, skuId
        # 分类: category, categoryName, categoryId, type
        # 销量: sales, salesCount, soldCount, saleNum
        # ============================================

        product = {
            "id": str(item.get("id") or item.get("productId") or item.get("goodsId") or ""),
            "name": item.get("name") or item.get("title") or item.get("productName") or item.get("goodsName") or "",
            "price": float(item.get("price") or item.get("salePrice") or item.get("retailPrice") or 0),
            "originalPrice": float(item.get("originalPrice") or item.get("marketPrice") or item.get("oldPrice") or 0),
            "image": item.get("image") or item.get("img") or item.get("productImg") or item.get("cover") or "",
            "category": item.get("category") or item.get("categoryName") or "",
            "description": item.get("description") or item.get("desc") or item.get("intro") or "",
            "sales": int(item.get("sales") or item.get("salesCount") or item.get("soldCount") or 0),
            "unit": item.get("unit") or "份",
            "spec": item.get("spec") or item.get("specification") or "",
        }

        # 跳过空数据
        if not product["name"]:
            return None

        return product

    except (ValueError, TypeError, KeyError) as e:
        print(f"  [警告] 解析商品失败: {e}")
        return None


def parse_category(cat: dict[str, Any]) -> dict[str, Any] | None:
    """解析分类数据"""
    try:
        return {
            "id": str(cat.get("id") or cat.get("categoryId") or cat.get("typeId") or ""),
            "name": cat.get("name") or cat.get("categoryName") or cat.get("typeName") or "",
            "icon": cat.get("icon") or cat.get("image") or "",
            "description": cat.get("description") or "",
        }
    except (ValueError, TypeError, KeyError):
        return None


def try_parse_json(text: str) -> Any:
    """尝试解析 JSON，支持嵌套结构"""
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        print("[错误] 无法解析 JSON，请确认文件内容是否为有效的 JSON 格式")
        return None

    # 如果数据被包裹在某个字段下，尝试自动展开
    if isinstance(data, dict):
        # 常见包裹字段
        for key in ["data", "result", "content", "list", "items", "records", "rows", "pageData"]:
            if key in data:
                inner = data[key]
                if isinstance(inner, (list, dict)):
                    return inner
        # 尝试找到第一个列表类型的值
        for key, value in data.items():
            if isinstance(value, list):
                return value

    return data


def extract_products(data: Any) -> list[dict[str, Any]]:
    """从解析后的数据中提取商品列表"""
    products = []

    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        # 尝试常见的列表字段
        items = None
        for key in ["list", "items", "records", "rows", "products", "goodsList", "productList", "dataList"]:
            if key in data and isinstance(data[key], list):
                items = data[key]
                break
        if items is None:
            items = [data]
    else:
        print("[错误] 无法识别的数据结构")
        return []

    for item in items:
        if isinstance(item, dict):
            product = parse_item(item)
            if product:
                products.append(product)

    return products


def extract_categories(data: Any) -> list[dict[str, Any]]:
    """从解析后的数据中提取分类列表"""
    categories = []

    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        items = None
        for key in ["categoryList", "categories", "types", "category", "typeList"]:
            if key in data and isinstance(data[key], list):
                items = data[key]
                break
        if items is None:
            return []
    else:
        return []

    for item in items:
        if isinstance(item, dict):
            cat = parse_category(item)
            if cat and cat["name"]:
                categories.append(cat)

    return categories


def generate_products_ts(products: list[dict[str, Any]], categories: list[dict[str, Any]]) -> str:
    """生成 products.ts 文件内容"""
    # 生成分类映射
    cat_map: dict[str, str] = {}
    for i, cat in enumerate(categories):
        cat_map[cat["name"]] = f"cat{i + 1}"

    # 如果没有抓到分类，从商品中提取
    if not categories:
        cat_names = sorted(set(p["category"] for p in products if p["category"]))
        for i, name in enumerate(cat_names):
            cat_map[name] = f"cat{i + 1}"

    lines: list[str] = []
    lines.append('import { Product, Category } from "@/types";')
    lines.append("")
    lines.append("// ===== 商品分类 ===== ")
    lines.append("export const categories: Category[] = [")

    for cat in categories:
        cat_id = cat_map.get(cat["name"], "cat_unknown")
        lines.append(f'  {{ id: "{cat_id}", name: "{cat["name"]}", ')
        lines.append(f'    icon: "{cat.get("icon", "")}", ')
        lines.append(f'    description: "{cat.get("description", "")}" }},')

    if not categories:
        for name, cat_id in cat_map.items():
            lines.append(f'  {{ id: "{cat_id}", name: "{name}", icon: "", description: "" }},')

    lines.append("];")
    lines.append("")
    lines.append("// ===== 商品数据 ===== ")
    lines.append("export const products: Product[] = [")

    for p in products:
        cat_id = cat_map.get(p["category"], "cat_unknown")
        lines.append("  {")
        lines.append(f'    id: "{p["id"]}",')
        lines.append(f'    name: "{p["name"]}",')
        lines.append(f'    price: {p["price"]},')
        lines.append(f'    originalPrice: {p["originalPrice"]},')
        lines.append(f'    image: "{p["image"]}",')
        lines.append(f'    category: "{cat_id}",')
        lines.append(f'    description: "{p["description"]}",')
        lines.append(f'    sales: {p["sales"]},')
        lines.append(f'    unit: "{p["unit"]}",')
        lines.append(f'    spec: "{p["spec"]}",')
        lines.append("  },")

    lines.append("];")
    lines.append("")
    lines.append("// ===== 按分类获取商品 ===== ")
    lines.append("export function getProductsByCategory(categoryId: string): Product[] {")
    lines.append("  return products.filter((p) => p.category === categoryId);")
    lines.append("}")
    lines.append("")
    lines.append("// ===== 获取单个商品 ===== ")
    lines.append("export function getProductById(id: string): Product | undefined {")
    lines.append("  return products.find((p) => p.id === id);")
    lines.append("}")
    lines.append("")
    lines.append("// ===== 获取推荐商品 ===== ")
    lines.append("export function getFeaturedProducts(): Product[] {")
    lines.append("  return products.filter((p) => p.sales > 0).slice(0, 8);")
    lines.append("}")

    return "\n".join(lines)


def generate_types_ts(products: list[dict[str, Any]]) -> str:
    """生成 types.ts 文件内容"""
    lines: list[str] = []
    lines.append("export interface Product {")
    lines.append("  id: string;")
    lines.append("  name: string;")
    lines.append("  price: number;")
    lines.append("  originalPrice: number;")
    lines.append("  image: string;")
    lines.append("  category: string;")
    lines.append("  description: string;")
    lines.append("  sales: number;")
    lines.append("  unit: string;")
    lines.append("  spec: string;")
    lines.append("}")
    lines.append("")
    lines.append("export interface Category {")
    lines.append("  id: string;")
    lines.append("  name: string;")
    lines.append("  icon: string;")
    lines.append("  description: string;")
    lines.append("}")
    lines.append("")
    lines.append("export interface CartItem {")
    lines.append("  product: Product;")
    lines.append("  quantity: number;")
    lines.append("}")

    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        print("用法: python parse-charles-data.py <response.json>")
        print("")
        print("步骤:")
        print("  1. 用 Charles 抓取川名堂小程序的数据")
        print("  2. 选中返回商品 JSON 的请求 -> Save Response... -> 保存为 response.json")
        print("  3. 运行: python parse-charles-data.py response.json")
        print("  4. 脚本会生成 parsed_products.ts 文件")
        sys.exit(1)

    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(f"[错误] 文件不存在: {filepath}")
        sys.exit(1)

    print(f"[信息] 读取文件: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    data = try_parse_json(text)
    if data is None:
        sys.exit(1)

    # 提取商品
    products = extract_products(data)
    print(f"[信息] 提取到 {len(products)} 个商品")

    # 提取分类
    categories = extract_categories(data)
    print(f"[信息] 提取到 {len(categories)} 个分类")

    if not products:
        print("[警告] 没有提取到商品数据，请检查 JSON 结构")
        print("[提示] 你可以把 JSON 文件内容发给我，我来帮你调整解析逻辑")
        sys.exit(1)

    # 生成输出
    output_dir = os.path.dirname(os.path.abspath(filepath))
    
    # 生成 products.ts
    products_ts = generate_products_ts(products, categories)
    output_path = os.path.join(output_dir, "parsed_products.ts")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(products_ts)
    print(f"[成功] 已生成: {output_path}")

    # 生成 types.ts
    types_ts = generate_types_ts(products)
    types_path = os.path.join(output_dir, "parsed_types.ts")
    with open(types_path, "w", encoding="utf-8") as f:
        f.write(types_ts)
    print(f"[成功] 已生成: {types_path}")

    # 打印预览
    print("\n" + "=" * 50)
    print("商品预览 (前5个):")
    print("=" * 50)
    for p in products[:5]:
        print(f"  [{p['category']}] {p['name']} - ¥{p['price']}")

    if categories:
        print("\n分类预览:")
        for c in categories:
            print(f"  {c['name']}")

    print(f"\n总共: {len(products)} 个商品, {len(categories)} 个分类")
    print("\n提示: 如果字段映射不对，请把 JSON 发给我，我来调整 parse_item() 函数")


if __name__ == "__main__":
    main()
