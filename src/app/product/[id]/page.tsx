"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { getProductById, products } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const product = getProductById(params.id as string);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="section">
        <div className="container-airbnb">
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2">
              商品未找到
            </h3>
            <p className="text-[var(--color-muted)] mb-6">
              抱歉，该商品不存在或已下架
            </p>
            <Link href="/products" className="btn-primary inline-flex">
              返回商品列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const categoryIcon =
    product.category === "hotpot" ? "🫕" :
    product.category === "chili" ? "🌶️" :
    product.category === "snack" ? "🥟" :
    product.category === "seasoning" ? "🧂" :
    product.category === "preserved" ? "🥩" : "🍵";

  return (
    <div className="section">
      <div className="container-airbnb">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-8">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">首页</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[var(--color-ink)] transition-colors">商品</Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-[var(--color-ink)] transition-colors"
          >
            {categoryIcon} {product.subcategory}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-ink)] truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Images */}
          <div>
            <div className="aspect-square rounded-[14px] bg-[var(--color-surface-soft)] flex items-center justify-center mb-4">
              <div className="text-center">
                <span className="text-8xl block mb-4">{categoryIcon}</span>
                <p className="text-sm text-[var(--color-muted)]">{product.name}</p>
              </div>
            </div>
            {/* Thumbnail strip */}
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-[14px] bg-[var(--color-surface-soft)] flex items-center justify-center text-2xl border-2 transition-colors ${
                    selectedImage === i
                      ? "border-[var(--color-primary)]"
                      : "border-transparent hover:border-[var(--color-hairline)]"
                  }`}
                >
                  {categoryIcon}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div>
            {/* Badge */}
            {product.badge && (
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-primary)] text-white text-xs font-semibold mb-3">
                {product.badge}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-[var(--color-star-rating)]">
                  ★ {product.rating}
                </span>
              </div>
              <span className="text-sm text-[var(--color-muted-soft)]">
                {product.reviewCount} 条评价
              </span>
              {product.sales && (
                <span className="text-sm text-[var(--color-muted-soft)]">
                  月销 {product.sales > 999 ? `${(product.sales / 1000).toFixed(1)}k` : product.sales}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-[var(--color-primary)]">
                ¥{product.price.toFixed(1)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-[var(--color-muted-soft)] line-through">
                    ¥{product.originalPrice.toFixed(1)}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-primary)] bg-red-50 px-2 py-0.5 rounded">
                    省 ¥{(product.originalPrice - product.price).toFixed(1)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-[var(--color-body)] leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Specs */}
            <div className="border-t border-[var(--color-hairline-soft)] pt-6 mb-6">
              <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-3">商品参数</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex items-center gap-2">
                    <span className="text-sm text-[var(--color-muted)]">{spec.label}：</span>
                    <span className="text-sm font-medium text-[var(--color-ink)]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="border-t border-[var(--color-hairline-soft)] pt-6 mb-6">
              <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-3">数量</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-[var(--color-hairline)] flex items-center justify-center hover:bg-[var(--color-surface-soft)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 text-center font-semibold text-[var(--color-ink)]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-[var(--color-hairline)] flex items-center justify-center hover:bg-[var(--color-surface-soft)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="btn-primary flex-1 text-base">
                加入购物车
              </button>
              <button className="btn-secondary flex-1 text-base">
                立即购买
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[var(--color-hairline-soft)]">
            <h2 className="text-xl font-bold text-[var(--color-ink)] mb-6">
              相关推荐
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
