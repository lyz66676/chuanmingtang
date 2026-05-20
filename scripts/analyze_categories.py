# -*- coding: utf-8 -*-
"""分析川名堂分类数据"""
import json
import os

cat_dir = r'C:\Users\Administrator\Desktop\chuan\e.chuanmingtang.cn\o2o\wxmicroapp\member\categoryandbrand'

print("=" * 60)
print("分类数据")
print("=" * 60)

for f in sorted(os.listdir(cat_dir)):
    fp = os.path.join(cat_dir, f)
    with open(fp, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    cat_list = data.get('data', {}).get('categoryList', [])
    code = f.split('code%3d')[1] if 'code%3d' in f else '?'
    print(f'\n--- code={code} ---')
    for cat in cat_list:
        cid = cat.get('id', '')
        ccode = cat.get('code', '')
        name = cat.get('name', '')
        parent_id = cat.get('parentId', '')
        print(f'  id={cid}, code={ccode}, name={name}, parentId={parent_id}')

print("\n" + "=" * 60)
print("商品数据 - 按子分类统计 (13xx 和 14xx)")
print("=" * 60)

prod_dir = r'C:\Users\Administrator\Desktop\chuan\e.chuanmingtang.cn\o2o\wxmicroapp\member\product'
cats = {}
for f in sorted(os.listdir(prod_dir)):
    fp = os.path.join(prod_dir, f)
    with open(fp, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    pl = data.get('data', {}).get('productList', {})
    if isinstance(pl, dict):
        items = pl.get('datas', [])
    else:
        items = pl if isinstance(pl, list) else []
    for item in items:
        cid = str(item.get('categoryId', ''))
        cname = item.get('categoryName', '')
        pname = item.get('productName', '')
        if cid.startswith('13') or cid.startswith('14'):
            if cid not in cats:
                cats[cid] = {'name': cname, 'products': []}
            cats[cid]['products'].append(pname)

for cid in sorted(cats.keys()):
    info = cats[cid]
    print(f'\n{cid}: {info["name"]} ({len(info["products"])}件)')
    for p in info['products'][:8]:
        print(f'  - {p}')
    if len(info['products']) > 8:
        print(f'  ... 还有{len(info["products"])-8}件')

print("\n" + "=" * 60)
print("所有分类的商品数量统计")
print("=" * 60)

all_cats = {}
for f in sorted(os.listdir(prod_dir)):
    fp = os.path.join(prod_dir, f)
    with open(fp, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    pl = data.get('data', {}).get('productList', {})
    if isinstance(pl, dict):
        items = pl.get('datas', [])
    else:
        items = pl if isinstance(pl, list) else []
    for item in items:
        cid = str(item.get('categoryId', ''))
        cname = item.get('categoryName', '')
        if cid not in all_cats:
            all_cats[cid] = {'name': cname, 'count': 0}
        all_cats[cid]['count'] += 1

for cid in sorted(all_cats.keys()):
    info = all_cats[cid]
    print(f'  {cid}: {info["name"]} - {info["count"]}件')
