"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { categories, products, featuredProducts, newProducts } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";

/* ── Decorative Corner SVG (inline, lightweight) ── */
function CornerOrnament({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 54V2H54" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M2 42V2H42" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
      <circle cx="2" cy="2" r="2.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

/* ── Lantern Decoration ── */
function LanternDecor({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`flex flex-col items-center ${className}`} style={style}>
      <div className="w-px h-6 bg-gradient-to-b from-transparent to-current opacity-30" />
      <div className="relative">
        <div className="w-5 h-6 rounded-[3px] border border-current opacity-20" />
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-sm border border-current opacity-20" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-sm border border-current opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-current opacity-15" />
      </div>
    </div>
  );
}

/* ── Category Card Images ── */
const categoryImages: Record<string, { src: string; bg: string }> = {
  wine: { src: "/images/products/10101074.jpg", bg: "from-amber-100 to-amber-50" },
  tea: { src: "/images/products/20202166.jpg", bg: "from-green-100 to-emerald-50" },
  snack: { src: "/images/products/30102099.jpg", bg: "from-red-100 to-orange-50" },
  seasoning: { src: "/images/products/40205021.jpg", bg: "from-yellow-100 to-orange-50" },
  other: { src: "/images/products/20502029.jpg", bg: "from-gray-100 to-gray-50" },
};

export default function HomePage() {
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");

  // 按销量排序取前8个热销商品（排除酒类和茶叶，展示亲民知名的零食和调味品）
  const hotProducts = [...products]
    .filter((p) => p.parentCategory !== "wine" && p.parentCategory !== "tea")
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 8);

  // 品牌故事区域使用本地图片
  const storyImages = {
    img1: "/images/story/11.png",
    img2: "/images/story/12.png",
    img3: "/images/story/13.png",
    img4: "/images/story/14.png",
  };

  return (
    <div>
      {/* ============================================ */}
      {/* Hero Section — Deep Sichuan Red + Gold accents */}
      {/* ============================================ */}
      <section
        className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden"
        style={{ backgroundColor: "#7f1d1d" }}
      >
        {/* Gradient Mesh Backdrop — 更鲜艳明亮的红色调 */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[900px] h-[900px] rounded-full opacity-50"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, #ef4444 0%, #dc2626 30%, transparent 60%)",
            }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[800px] h-[800px] rounded-full opacity-35"
            style={{
              background:
                "radial-gradient(circle at 70% 50%, #fbbf24 0%, #f59e0b 25%, transparent 55%)",
            }}
          />
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-45"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, #ef4444 0%, #dc2626 25%, transparent 55%)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-[500px] h-[300px] rounded-full opacity-25"
            style={{
              background:
                "radial-gradient(circle at 50% 100%, #fbbf24 0%, transparent 50%)",
            }}
          />
          {/* Geometric pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(30deg, rgba(255,255,255,0.08) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.08) 87.5%),
                linear-gradient(150deg, rgba(255,255,255,0.08) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.08) 87.5%)
              `,
              backgroundSize: "80px 140px",
              backgroundPosition: "0 0, 0 0, 40px 70px, 40px 70px",
            }}
          />
        </div>

        {/* Corner Ornaments — Gold */}
        <div className="ornament-container">
          <CornerOrnament className="ornament ornament-tl ornament-gold" />
          <CornerOrnament className="ornament ornament-tr ornament-gold" />
          <CornerOrnament className="ornament ornament-bl ornament-gold" />
          <CornerOrnament className="ornament ornament-br ornament-gold" />
        </div>

        {/* Lanterns — Left & Right */}
        <LanternDecor className="absolute top-12 left-8 md:left-16 text-[#f59e0b] animate-lantern" />
        <LanternDecor className="absolute top-12 right-8 md:right-16 text-[#f59e0b] animate-lantern" style={{ animationDelay: "0.5s" } as React.CSSProperties} />

        <div className="relative z-10 w-full">
          <div className="container-airbnb">
            <div className="max-w-3xl mx-auto text-center">
              {/* Floating badge */}
              <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(185, 28, 28, 0.6)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    backdropFilter: "blur(8px)",
                    color: "#f59e0b",
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
                  <span className="text-sm font-medium">正宗四川味道 · 产地直发</span>
                </span>
              </div>

              {/* Headline */}
              <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-[-0.03em] text-white mb-4">
                  川名堂上地华联店
                </h1>
                <p
                  className="text-xl sm:text-2xl md:text-3xl font-normal leading-relaxed mb-3 tracking-[-0.01em]"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  传承四川味道，精选地道特产
                </p>
                <p
                  className="text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
                  style={{ color: "rgba(255, 255, 255, 0.55)" }}
                >
                  从火锅底料到特色小吃，从秘制辣椒酱到传统腊味，
                  <br className="hidden sm:block" />
                  我们精心挑选每一份四川特产，让您足不出户品味巴蜀风情。
                </p>
              </div>

              {/* Pill Search Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (heroSearchQuery.trim()) {
                    router.push(`/products?search=${encodeURIComponent(heroSearchQuery.trim())}`);
                  }
                }}
                className="animate-fade-in-up max-w-2xl mx-auto mb-10"
                style={{ animationDelay: "0.35s" }}
              >
                <div className="flex items-center bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-white/10 p-1.5">
                  <div className="flex-1 flex items-center px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer group">
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      value={heroSearchQuery}
                      onChange={(e) => setHeroSearchQuery(e.target.value)}
                      placeholder={`搜索 ${products.length} 件四川特产...`}
                      className="ml-3 text-sm text-gray-900 bg-transparent outline-none flex-1 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="hidden sm:flex items-center px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer group">
                    <span className="text-sm text-gray-400 group-hover:text-gray-900 transition-colors">
                      全部分类
                    </span>
                  </div>
                  {/* Search Orb — Gold */}
                  <button
                    type="submit"
                    className="ml-1 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: "#f59e0b",
                      boxShadow: "0 4px 15px rgba(245, 158, 11, 0.35)",
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: "#1a0a0a" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </button>
                </div>
              </form>

              {/* CTA Buttons */}
              <div
                className="animate-fade-in-up flex items-center justify-center gap-4"
                style={{ animationDelay: "0.5s" }}
              >
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: "#f59e0b",
                    color: "#1a0a0a",
                    boxShadow: "0 4px 20px rgba(245, 158, 11, 0.3)",
                  }}
                >
                  立即选购
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition-all hover:bg-white/10"
                  style={{
                    border: "1.5px solid rgba(255, 255, 255, 0.2)",
                    color: "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  了解我们
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: "linear-gradient(to top, #7f1d1d 0%, transparent 100%)",
          }}
        />
      </section>

      {/* ============================================ */}
      {/* Categories Section — White + Red ornaments */}
      {/* ============================================ */}
      <section className="relative bg-white overflow-hidden">
        {/* Decorative top border */}
        <div className="border-ornament-top" />

        <div className="ornament-container">
          <CornerOrnament className="ornament ornament-tl ornament-red" />
          <CornerOrnament className="ornament ornament-tr ornament-red" />
          <CornerOrnament className="ornament ornament-bl ornament-red" />
          <CornerOrnament className="ornament ornament-br ornament-red" />
        </div>

        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #171717 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container-airbnb relative py-20 md:py-28">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] mb-3 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              CATEGORIES
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] tracking-[-0.02em] mb-3">
              商品分类
            </h2>
            <p className="text-[var(--color-muted)] text-base md:text-lg max-w-lg mx-auto">
              {categories.length}大品类，{products.length}件商品，精选四川各地特产
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {categories.map((cat, index) => {
              const catImg = categoryImages[cat.id] || { src: "/images/products/10101074.jpg", bg: "from-gray-100 to-gray-50" };
              const catProductCount = products.filter(p => p.parentCategory === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className={`group relative overflow-hidden rounded-2xl bg-white border p-5 md:p-6 text-center transition-all duration-300 cursor-pointer ${
                    hoveredCategory === cat.id
                      ? "border-[var(--color-primary)]/20 shadow-[0_8px_30px_rgba(185,28,28,0.08),0_2px_8px_rgba(185,28,28,0.04)] -translate-y-[3px]"
                      : "border-[var(--color-hairline)] shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)]"
                  }`}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${0.1 + index * 0.06}s both`,
                  }}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => (window.location.href = `/products?category=${cat.id}`)}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/0 via-transparent to-[var(--color-primary)]/0 transition-all duration-500 ${
                      hoveredCategory === cat.id
                        ? "from-[var(--color-primary)]/[0.03] to-[var(--color-primary)]/[0.03]"
                        : ""
                    }`}
                  />

                  <div className="relative">
                    <div className={`w-full aspect-square mx-auto mb-3 rounded-xl bg-gradient-to-br ${catImg.bg} overflow-hidden transition-transform duration-300 ${
                      hoveredCategory === cat.id ? "scale-105" : ""
                    }`}>
                      <Image
                        src={catImg.src}
                        alt={cat.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <h3
                      className={`text-sm font-semibold mb-1 leading-relaxed line-clamp-1 transition-colors ${
                        hoveredCategory === cat.id
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--color-ink)]"
                      }`}
                    >
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed line-clamp-2 mb-1">
                      {cat.description}
                    </p>
                    <span className="text-[10px] text-[var(--color-muted-soft)]">
                      {catProductCount}件商品
                    </span>
                  </div>

                  <div
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[var(--color-primary)] rounded-full transition-all duration-300 ${
                      hoveredCategory === cat.id ? "w-12" : "w-0"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Hot Products — 热销排行 */}
      {/* ============================================ */}
      <section
        className="relative overflow-hidden text-white"
        style={{ backgroundColor: "#1a0a0a" }}
      >
        <div className="ornament-container">
          <CornerOrnament className="ornament ornament-tl ornament-gold" />
          <CornerOrnament className="ornament ornament-tr ornament-gold" />
          <CornerOrnament className="ornament ornament-bl ornament-gold" />
          <CornerOrnament className="ornament ornament-br ornament-gold" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(30deg, rgba(255,255,255,0.06) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.06) 87.5%),
              linear-gradient(150deg, rgba(255,255,255,0.06) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.06) 87.5%)
            `,
            backgroundSize: "60px 105px",
            backgroundPosition: "0 0, 0 0, 30px 52px, 30px 52px",
          }}
        />

        <div className="container-airbnb relative py-20 md:py-28">
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium mb-3 tracking-wide" style={{ color: "#f59e0b" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                HOT SELLING
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.02em] mb-3 text-white">
                热销爆款
              </h2>
              <p className="text-base md:text-lg max-w-lg" style={{ color: "rgba(255, 255, 255, 0.55)" }}>
                大家都在买的人气商品，精选好评如潮的四川味道
              </p>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all group"
              style={{ border: "1px solid rgba(255, 255, 255, 0.15)", color: "rgba(255, 255, 255, 0.75)" }}
            >
              查看全部
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {hotProducts.slice(0, 8).map((product, index) => (
              <div key={product.id} style={{ animation: `fadeInUp 0.5s ease-out ${0.1 + index * 0.06}s both` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
              style={{ border: "1px solid rgba(255, 255, 255, 0.15)", color: "rgba(255, 255, 255, 0.75)" }}
            >
              查看全部商品
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Brand Story Section — Warm + Red ornaments */}
      {/* ============================================ */}
      <section className="relative bg-[var(--color-canvas-warm)] overflow-hidden">
        <div className="ornament-container">
          <CornerOrnament className="ornament ornament-tl ornament-red" />
          <CornerOrnament className="ornament ornament-tr ornament-red" />
          <CornerOrnament className="ornament ornament-bl ornament-red" />
          <CornerOrnament className="ornament ornament-br ornament-red" />
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.04]">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[var(--color-primary)]" />
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.03]">
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[var(--color-accent)]" />
        </div>

        <div className="container-airbnb relative py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 aspect-square flex items-center justify-center overflow-hidden group">
                    {storyImages.img1 ? (
                      <img
                        src={storyImages.img1}
                        alt="四川烹饪调料"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-7xl animate-float">🌶️</span>
                    )}
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-accent)]/5 aspect-[4/3] flex items-center justify-center overflow-hidden group">
                    {storyImages.img2 ? (
                      <img
                        src={storyImages.img2}
                        alt="四川调味品"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-5xl">🫕</span>
                    )}
                  </div>
                </div>
                <div className="space-y-3 pt-8">
                  <div className="rounded-2xl bg-gradient-to-br from-[var(--color-primary-deep)]/10 to-[var(--color-primary-deep)]/5 aspect-[3/4] flex items-center justify-center overflow-hidden group">
                    {storyImages.img3 ? (
                      <img
                        src={storyImages.img3}
                        alt="四川特色小吃"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-6xl">🥟</span>
                    )}
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/5 aspect-square flex items-center justify-center overflow-hidden group">
                    {storyImages.img4 ? (
                      <img
                        src={storyImages.img4}
                        alt="四川茗茶"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-5xl">🍵</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] mb-3 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                OUR STORY
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] tracking-[-0.02em] mb-6">
                源自巴蜀
                <span className="block text-[var(--color-body)] text-xl md:text-2xl font-normal mt-2 tracking-normal">
                  每一口都是地道四川味
                </span>
              </h2>
              <p className="text-[var(--color-body)] leading-relaxed mb-6">
                川名堂上地华联店深耕四川特产行业多年。我们走遍巴蜀大地，从郫县豆瓣到汉源花椒，
                从自贡冷吃兔到峨眉山茶，从宜宾燃面到灯影牛肉，只为寻找最地道的四川味道。
              </p>
              <p className="text-[var(--color-muted)] leading-relaxed mb-8">
                每一份产品都经过严格筛选，确保正宗品质。我们相信，真正的四川味道，
                能让每个人感受到巴蜀大地的热情与魅力。目前我们已精选{products.length}款地道四川特产，
                涵盖{categories.length}大品类，让您足不出户，吃遍四川。
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline group"
              >
                了解更多故事
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Featured Products — 精选推荐 */}
      {/* ============================================ */}
      <section className="relative bg-white overflow-hidden">
        <div className="border-ornament-top" />

        <div className="ornament-container">
          <CornerOrnament className="ornament ornament-tl ornament-red" />
          <CornerOrnament className="ornament ornament-tr ornament-red" />
          <CornerOrnament className="ornament ornament-bl ornament-red" />
          <CornerOrnament className="ornament ornament-br ornament-red" />
        </div>

        <div className="container-airbnb py-20 md:py-28">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] mb-3 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              RECOMMENDED
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] tracking-[-0.02em] mb-3">
              精选推荐
            </h2>
            <p className="text-[var(--color-muted)] text-base md:text-lg max-w-lg mx-auto">
              精心挑选的四川特产，每一款都值得品尝
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <div key={product.id} style={{ animation: `fadeInUp 0.5s ease-out ${0.05 + index * 0.04}s both` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              查看全部 {products.length} 件商品
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Category Showcase — 分类展示 */}
      {/* ============================================ */}
      <section className="relative bg-[var(--color-canvas-warm)] overflow-hidden">
        <div className="ornament-container">
          <CornerOrnament className="ornament ornament-tl ornament-red" />
          <CornerOrnament className="ornament ornament-tr ornament-red" />
          <CornerOrnament className="ornament ornament-bl ornament-red" />
          <CornerOrnament className="ornament ornament-br ornament-red" />
        </div>

        <div className="container-airbnb relative py-20 md:py-28">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] mb-3 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              CATEGORY SHOWCASE
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] tracking-[-0.02em] mb-3">
              分类精选
            </h2>
            <p className="text-[var(--color-muted)] text-base md:text-lg max-w-lg mx-auto">
              每个品类都有惊喜，发现您喜爱的四川味道
            </p>
          </div>

          {/* 展示前4个主要分类的商品 */}
          {["seasoning", "snack", "wine", "tea"].map((catId, sectionIdx) => {
            const cat = categories.find(c => c.id === catId);
            if (!cat) return null;
            const catProducts = products.filter(p => p.parentCategory === catId).slice(0, 4);
            if (catProducts.length === 0) return null;
            const catImg = categoryImages[catId] || { src: "/images/products/10101074.jpg", bg: "from-gray-100 to-gray-50" };

            return (
              <div key={catId} className={`${sectionIdx > 0 ? 'mt-16 pt-12 border-t border-[var(--color-hairline-soft)]' : ''}`}>
                <div className="flex items-end justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${catImg.bg} overflow-hidden`}>
                      <Image
                        src={catImg.src}
                        alt={cat.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--color-ink)]">{cat.name}</h3>
                      <p className="text-sm text-[var(--color-muted)]">{cat.description}</p>
                    </div>
                  </div>
                  <Link
                    href={`/products?category=${cat.id}`}
                    className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    查看全部 →
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                  {catProducts.map((product, index) => (
                    <div key={product.id} style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================ */}
      {/* Features Section — Dark + Gold ornaments */}
      {/* ============================================ */}
      <section
        className="relative overflow-hidden text-white"
        style={{ backgroundColor: "#1a0a0a" }}
      >
        <div className="ornament-container">
          <CornerOrnament className="ornament ornament-tl ornament-gold" />
          <CornerOrnament className="ornament ornament-tr ornament-gold" />
          <CornerOrnament className="ornament ornament-bl ornament-gold" />
          <CornerOrnament className="ornament ornament-br ornament-gold" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(30deg, rgba(255,255,255,0.06) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.06) 87.5%),
              linear-gradient(150deg, rgba(255,255,255,0.06) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.06) 87.5%)
            `,
            backgroundSize: "60px 105px",
            backgroundPosition: "0 0, 0 0, 30px 52px, 30px 52px",
          }}
        />

        <div className="container-airbnb relative py-20 md:py-28">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium mb-3 tracking-wide" style={{ color: "#f59e0b" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              WHY CHUANMINGTANG
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.02em] mb-3 text-white">
              为什么选择川名堂
            </h2>
            <p className="text-base md:text-lg max-w-lg mx-auto" style={{ color: "rgba(255, 255, 255, 0.55)" }}>
              品质保证，用心服务，让您购物无忧
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: "🚚", title: "全国包邮", desc: "满99元全国包邮，快速送达" },
              { icon: "✅", title: "品质保证", desc: "精选四川地道特产，严格品控" },
              { icon: "🛡️", title: "质保售后", desc: "质量有问题随时退换" },
              { icon: "🏪", title: "十五年老店", desc: "专业客服团队，随时为您服务" },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-2xl transition-all duration-300 hover:bg-white/5"
                style={{ animation: `fadeInUp 0.5s ease-out ${0.1 + index * 0.1}s both` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.55)" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Newsletter / CTA Section */}
      {/* ============================================ */}
      <section className="relative bg-gradient-to-br from-[#b91c1c] to-[#dc2626] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle at 50% 50%, #f59e0b 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle at 50% 50%, #fff 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="container-airbnb relative py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-[-0.02em] mb-4">
              开启四川美食之旅
            </h2>
            <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed">
              订阅我们的资讯，第一时间获取新品上架和优惠活动信息
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="输入您的邮箱地址"
                className="flex-1 px-5 py-3.5 rounded-full border border-white/20 bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              />
              <button
                className="px-8 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                style={{ backgroundColor: "#f59e0b", color: "#1a0a0a" }}
              >
                订阅
              </button>
            </div>
            <p className="text-xs text-white/40 mt-4">
              订阅即表示您同意接收营销邮件，您可以随时退订
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
