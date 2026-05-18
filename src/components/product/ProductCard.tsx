import Link from "next/link";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="card group block">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-[var(--color-surface-soft)] overflow-hidden">
        {/* Placeholder with gradient */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl mb-2 block">
              {product.category === "hotpot" ? "🫕" :
               product.category === "chili" ? "🌶️" :
               product.category === "snack" ? "🥟" :
               product.category === "seasoning" ? "🧂" :
               product.category === "preserved" ? "🥩" : "🍵"}
            </span>
            <span className="text-xs text-[var(--color-muted)] block mt-1">{product.name}</span>
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 badge bg-[var(--color-primary)] text-white">
            {product.badge}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[var(--color-ink)] line-clamp-2 mb-1 group-hover:underline">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-sm font-semibold text-[var(--color-star-rating)]">
            ★ {product.rating}
          </span>
          <span className="text-xs text-[var(--color-muted-soft)]">
            ({product.reviewCount})
          </span>
          {product.sales && (
            <span className="text-xs text-[var(--color-muted-soft)] ml-auto">
              月销 {product.sales > 999 ? `${(product.sales / 1000).toFixed(1)}k` : product.sales}
            </span>
          )}
        </div>

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
