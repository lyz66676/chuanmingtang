"use client";

import Link from "next/link";
import React from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

const categoryEmoji: Record<string, string> = {
  baijiu: "🍶",
  red_wine: "🍷",
  other_wine: "🍸",
  green_tea: "🍵",
  black_tea: "🍵",
  flower_tea: "🌺",
  tibetan_tea: "🍵",
  meat_snack: "🥩",
  veggie_snack: "🥬",
  candy: "🍬",
  table_seasoning: "🧂",
  cooking_seasoning: "🍳",
  dried_goods: "🥜",
  other_food: "🍱",
  tea_set: "🫖",
  other: "📦",
};

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = React.useState(false);
  const [added, setAdded] = React.useState(false);
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/product/${product.id}`} className="card group block">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-[var(--color-surface-soft)] overflow-hidden">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-5xl mb-2 block">
                {categoryEmoji[product.category] || "📦"}
              </span>
              <span className="text-xs text-[var(--color-muted)] block mt-1">{product.name}</span>
            </div>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 badge bg-[var(--color-primary)] text-white">
            {product.badge}
          </span>
        )}

        {/* Quick Add Button (mobile friendly) */}
        <button
          onClick={handleQuickAdd}
          className={`absolute bottom-2 right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            added
              ? "bg-green-500 text-white scale-110"
              : "bg-white text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
          }`}
          aria-label="快速加入购物车"
        >
          {added ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[var(--color-ink)] line-clamp-2 mb-1 group-hover:underline">
          {product.name}
        </h3>

        {/* Sales Info */}
        {product.sales && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-[var(--color-muted-soft)]">
              月销 {product.sales > 999 ? `${(product.sales / 1000).toFixed(1)}k` : product.sales}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[var(--color-primary)]">
            ¥{product.price.toFixed(1)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-[var(--color-muted-soft)] line-through">
              ¥{product.originalPrice.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
