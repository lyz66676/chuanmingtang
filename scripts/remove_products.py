"""Dry-run / apply removal of products from src/data/products.ts."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "data" / "products.ts"


def parse_products(text: str) -> list[dict]:
    lines = text.splitlines()
    products: list[dict] = []
    block: list[str] = []
    depth = 0
    start = None
    marker = next(
        i
        for i, line in enumerate(lines)
        if line.startswith("export const products")
    )
    for idx, line in enumerate(lines):
        if idx <= marker:
            continue
        if not block and line == "];":
            break
        if depth == 0 and re.match(r"^  \{", line):
            start = idx
            block = [line]
            depth += line.count("{") - line.count("}")
            continue
        if block:
            block.append(line)
            depth += line.count("{") - line.count("}")
            if depth == 0:
                joined = "\n".join(block)
                id_match = re.search(r'id: "([^"]+)"', joined)
                name_match = re.search(r'name: "([^"]*)"', joined)
                cat_match = re.search(r'category: "([^"]+)"', joined)
                products.append(
                    {
                        "id": id_match.group(1) if id_match else None,
                        "name": name_match.group(1) if name_match else None,
                        "category": cat_match.group(1) if cat_match else None,
                        "start": start,
                        "end": idx,
                    }
                )
                block = []
                depth = 0
                start = None
    return products


def should_delete(product: dict) -> bool:
    name = product["name"] or ""
    category = product["category"] or ""

    brand_keywords = [
        "巴蜀公社",
        "蜀香",
        "高金",
        "美乐",
        "松茸牦牛肉酱",
        "东汉",
        "色湾",
        "中冠",
        "眉州东坡",
        "密奇奇",
        "润成",
        "缠丝兔",
        "口水族",
        "遛遛牛",
        "神沟九寨",
        "潼川豆豉",
    ]
    if any(k in name for k in brand_keywords):
        return True

    name_keywords = [
        "冻干松茸",
        "素燃面",
        "马边天麻切片",
        "观音素麻花",
        "苦荞黑芝麻糕",
        "苦荞煎饼",
        "黑山羊羊肉汤",
        "老四川烧烤牛肉",
        "荷叶茶",
        "泸州小百年",
        "绵竹大曲",
        "泸州小特曲",
        "小五粮",
        "精品头曲D9",
        "沱牌老窖原浆",
        "泸州老窖头曲金卡",
        "永福",
        "万寿吉祥",
        "粽",
    ]
    if any(k in name for k in name_keywords):
        return True

    if category == "other":
        return True

    if category == "tea" and re.match(r"^40g", name):
        return True

    if name in {"200g肥肠袋装", "248g笋子肥肠", "260g肥肠米粉"}:
        return True

    return False


def main() -> int:
    apply = "--apply" in sys.argv
    text = DATA.read_text(encoding="utf-8")
    products = parse_products(text)
    kept = [p for p in products if not should_delete(p)]
    removed = [p for p in products if should_delete(p)]

    print(f"total={len(products)} kept={len(kept)} removed={len(removed)}")
    removed_by_rule: dict[str, list[str]] = {}
    for p in removed:
        name = p["name"] or p["id"] or "?"
        if any(k in name for k in ["巴蜀公社", "蜀香", "高金", "美乐", "松茸牦牛肉酱", "东汉", "色湾", "中冠", "眉州东坡", "密奇奇", "润成", "缠丝兔", "口水族", "遛遛牛", "神沟九寨", "潼川豆豉"]):
            rule = "brand"
        elif "粽" in name:
            rule = "粽子"
        elif "肥肠" in name:
            rule = "肥肠"
        elif p["category"] == "other":
            rule = "other分类"
        elif p["category"] == "tea" and re.match(r"^40g", name):
            rule = "茶叶40g"
        else:
            rule = "按名称"
        removed_by_rule.setdefault(rule, []).append(name)
    for rule, names in removed_by_rule.items():
        print(f"-- {rule} ({len(names)})")
        for name in sorted(names):
            print(f"   {name}")

    if not apply:
        print("dry-run only, pass --apply to write")
        return 0

    drop = set()
    for p in removed:
        drop.update(range(p["start"], p["end"] + 1))
    lines = text.splitlines()
    out_lines: list[str] = []
    for idx, line in enumerate(lines):
        if idx in drop:
            continue
        if line == "// 商品总数: 414":
            out_lines.append(f"// 商品总数: {len(kept)}")
        else:
            out_lines.append(line)
    out_text = "\n".join(out_lines)
    with DATA.open("w", encoding="utf-8", newline="\r\n") as fh:
        fh.write(out_text + "\r\n")
    print(f"written {len(kept)} products")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
