# -*- coding: utf-8 -*-
"""分析川名堂商品数据中的分类分布"""
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

prod_dir = r'C:\Users\Administrator\Desktop\chuan\e.chuanmingtang.cn\o2o\wxmicroapp\member\product'

# 统计所有 categoryId 的分布
cat_stats = {}
sample_products = {}

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
        key = f'{cid}: {cname}'
        if key not in cat_stats:
            cat_stats[key] = 0
            sample_products[key] = []
        cat_stats[key] += 1
        if len(sample_products[key]) < 5:
            sample_products[key].append(pname)

print("=" * 60)
print("所有 categoryId 分布")
print("=" * 60)
for key in sorted(cat_stats.keys()):
    print(f'\n{key} - {cat_stats[key]}件')
    for p in sample_products[key]:
        print(f'  - {p}')

print("\n" + "=" * 60)
print("按 categoryCode (文件前缀) 统计")
print("=" * 60)

code_stats = {}
for f in sorted(os.listdir(prod_dir)):
    fp = os.path.join(prod_dir, f)
    # 从文件名提取 categoryCode
    # list?pageIndex=1&pageSize=10&filter=&categoryCode=11&brandId=...
    import re
    m = re.search(r'categoryCode=(\d+)', f)
    code = m.group(1) if m else '?'
    with open(fp, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    pl = data.get('data', {}).get('productList', {})
    if isinstance(pl, dict):
        items = pl.get('datas', [])
    else:
        items = pl if isinstance(pl, list) else []
    if code not in code_stats:
        code_stats[code] = {'count': 0, 'cat_ids': {}}
    code_stats[code]['count'] += len(items)
    for item in items:
        cid = str(item.get('categoryId', ''))
        if cid not in code_stats[code]['cat_ids']:
            code_stats[code]['cat_ids'][cid] = 0
        code_stats[code]['cat_ids'][cid] += 1

for code in sorted(code_stats.keys()):
    info = code_stats[code]
    print(f'\ncategoryCode={code}: {info["count"]}件')
    for cid, cnt in sorted(info['cat_ids'].items()):
        print(f'  categoryId={cid}: {cnt}件')
