"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import Link from "next/link";
import { products, categories, getCategoryById } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";

// 子分类定义（基于 CATEGORY_MAP 结构）
const SUBCATEGORIES: Record<string, { id: string; name: string }[]> = {
  snack: [
    { id: "meat_snack", name: "肉类小吃" },
    { id: "veggie_snack", name: "素食小吃" },
    { id: "candy", name: "糖果糕点" },
  ],
  seasoning: [
    { id: "table_seasoning", name: "佐餐调味" },
    { id: "cooking_seasoning", name: "烹饪调味" },
    { id: "dried_goods", name: "干货" },
  ],
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const activeSubcategory = searchParams.get("subcategory") || "";
  const searchQuery = searchParams.get("search") || "";

  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by parent category
    if (activeCategory !== "all") {
      result = result.filter((p) => p.parentCategory === activeCategory);
    }

    // Filter by subcategory (using subcategory name match)
    if (activeSubcategory) {
      const subcatName = SUBCATEGORIES[activeCategory]?.find(
        (s) => s.id === activeSubcategory
      )?.name;
      if (subcatName) {
        result = result.filter((p) => p.subcategory === subcatName);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeCategory, activeSubcategory, searchQuery]);

  const activeCat =
    activeCategory !== "all" ? getCategoryById(activeCategory) : null;
  const subcategories = activeCategory
    ? SUBCATEGORIES[activeCategory] || []
    : [];

  const pageTitle = searchQuery
    ? `🔍 搜索"${searchQuery}"`
    : activeCat
      ? `${activeCat.icon} ${activeCat.name}`
      : "📋 全部商品";

  const pageDesc = searchQuery
    ? `找到 ${filteredProducts.length} 件相关商品`
    : activeCat
      ? activeCat.description
      : "浏览所有四川特产";

  return (
    <div className="section">
      <div className="container-airbnb">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-2">
            {pageTitle}
          </h1>
          <p className="text-[var(--color-muted)]">{pageDesc}</p>
        </div>

        {/* Category Filter (hide when searching) */}
        {!searchQuery && (
          <div className="mb-8">
            {/* Primary Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Link
                href="/products"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === "all"
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface-soft)] text-[var(--color-ink)] hover:bg-[var(--color-hairline-soft)]"
                }`}
              >
                全部
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface-soft)] text-[var(--color-ink)] hover:bg-[var(--color-hairline-soft)]"
                  }`}
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>

            {/* Secondary Subcategory Tabs (only for categories with subcategories) */}
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 ml-2 pl-4 border-l-2 border-[var(--color-hairline-soft)]">
                <Link
                  href={`/products?category=${activeCategory}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    !activeSubcategory
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  全部{activeCat?.name}
                </Link>
                {subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/products?category=${activeCategory}&subcategory=${sub.id}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      activeSubcategory === sub.id
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-[var(--color-muted)] mb-6">
          共 {filteredProducts.length} 件商品
        </p>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2">
              {searchQuery ? "未找到相关商品" : "暂无商品"}
            </h3>
            <p className="text-[var(--color-muted)] mb-6">
              {searchQuery
                ? `没有找到与"${searchQuery}"相关的商品，试试其他关键词吧`
                : "该分类下还没有商品，看看其他分类吧"}
            </p>
            <Link href="/products" className="btn-primary inline-flex">
              查看全部商品
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="section">
          <div className="container-airbnb">
            <div className="text-center py-20">
              <div className="animate-spin text-4xl mb-4">🌶️</div>
              <p className="text-[var(--color-muted)]">加载中...</p>
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
