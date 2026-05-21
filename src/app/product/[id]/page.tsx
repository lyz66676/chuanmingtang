"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { getProductById, products, getCategoryById } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/context/CartContext";
import { useAuth, getToken } from "@/context/AuthContext";

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const product = getProductById(params.id as string);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [buying, setBuying] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();

  // 所有展示图：主图 + 多角度展示图（1.jpg ~ 4.jpg）
  const displayImages = useMemo(() => {
    const images: string[] = [product?.image || ""];
    if (product?.images) {
      product.images.forEach((img) => {
        if (!images.includes(img)) images.push(img);
      });
    }
    return images;
  }, [product]);

  // "立即购买" - 跳转到结算页，携带商品信息
  const handleBuyNow = async () => {
    if (!product) return;

    // 未登录则跳转到登录页
    if (!user) {
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }

    // 将商品信息存入 localStorage，供结算页读取
    const buyNowItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      category: product.category,
    };
    localStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
    localStorage.setItem("buyNowTotal", String(product.price * quantity));

    // 跳转到结算页
    router.push("/checkout?buyNow=1");
  };

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

  const catInfo = getCategoryById(product.category);
  const emoji = categoryEmoji[product.category] || "📦";

  return (
    <div className="section pb-24 md:pb-12">
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
            {emoji} {catInfo?.name || product.subcategory}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-ink)] truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Product Images with Thumbnail Strip */}
          <div>
            <div className="aspect-square rounded-[14px] bg-[var(--color-surface-soft)] flex items-center justify-center overflow-hidden mb-4">
              {!imgError ? (
                <img
                  src={displayImages[selectedImage] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="text-center">
                  <span className="text-8xl block mb-4">{emoji}</span>
                  <p className="text-sm text-[var(--color-muted)]">{product.name}</p>
                </div>
              )}
            </div>
            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedImage(i); setImgError(false); }}
                    className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      i === selectedImage
                        ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]"
                        : "border-[var(--color-hairline-soft)] hover:border-[var(--color-muted)]"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
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
{/* Sales Info */}
{product.sales && (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-sm text-[var(--color-muted-soft)]">
      月销 {product.sales > 999 ? `${(product.sales / 1000).toFixed(1)}k` : product.sales}
    </span>
  </div>
)}


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

            {/* Desktop Actions (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => {
                  addItem(product, quantity);
                  setAddedToCart(true);
                  setTimeout(() => setAddedToCart(false), 2000);
                }}
                className={`btn-primary flex-1 text-base transition-all ${
                  addedToCart ? "scale-105" : ""
                }`}
              >
                {addedToCart ? "✓ 已加入购物车" : "加入购物车"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={buying}
                className="btn-secondary flex-1 text-base inline-flex items-center justify-center disabled:opacity-50"
              >
                {buying ? "创建订单中..." : "立即购买"}
              </button>
            </div>
          </div>
        </div>

        {/* Product Description Image (sm_1.jpg 商品介绍长图) */}
        {product.descriptionImage && (
          <section className="mt-16 pt-12 border-t border-[var(--color-hairline-soft)]">
            <h2 className="text-xl font-bold text-[var(--color-ink)] mb-6">
              商品介绍
            </h2>
            <div className="rounded-[14px] bg-[var(--color-surface-soft)] overflow-hidden">
              <img
                src={product.descriptionImage}
                alt={`${product.name} 商品介绍`}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </section>
        )}

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

      {/* Mobile Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--color-hairline-soft)] md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[var(--color-primary)]">
              ¥{(product.price * quantity).toFixed(1)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[var(--color-muted-soft)] line-through">
                ¥{product.originalPrice.toFixed(1)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                addItem(product, quantity);
                setAddedToCart(true);
                setTimeout(() => setAddedToCart(false), 2000);
              }}
              className="px-5 py-2.5 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              {addedToCart ? "✓ 已加入" : "加入购物车"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={buying}
              className="px-6 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {buying ? "..." : "立即购买"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
