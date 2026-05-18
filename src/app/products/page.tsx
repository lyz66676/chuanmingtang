"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { products, categories, getCategoryById } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";

function ProductsContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const activeCat = activeCategory !== "all" ? getCategoryById(activeCategory) : null;

  return (
    <div className="section">
      <div className="container-airbnb">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-2">
            {activeCat ? `${activeCat.icon} ${activeCat.name}` : "📋 全部商品"}
          </h1>
          <p className="text-[var(--color-muted)]">
            {activeCat ? activeCat.description : "浏览所有四川特产"}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
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
              暂无商品
            </h3>
            <p className="text-[var(--color-muted)] mb-6">
              该分类下还没有商品，看看其他分类吧
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
