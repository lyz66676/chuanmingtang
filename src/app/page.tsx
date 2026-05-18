"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, products, featuredProducts } from "@/data/products";
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
      {/* string */}
      <div className="w-px h-6 bg-gradient-to-b from-transparent to-current opacity-30" />
      {/* lantern body */}
      <div className="relative">
        <div className="w-5 h-6 rounded-[3px] border border-current opacity-20" />
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-sm border border-current opacity-20" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-sm border border-current opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-current opacity-15" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <div>
      {/* ============================================ */}
      {/* Hero Section — Deep Sichuan Red + Gold accents */}
      {/* ============================================ */}
      <section
        className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden"
        style={{ backgroundColor: "#1a0a0a" }}
      >
        {/* Gradient Mesh Backdrop */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[900px] h-[900px] rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, #b91c1c 0%, #7f1d1d 40%, transparent 65%)",
            }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-[800px] h-[800px] rounded-full opacity-25"
            style={{
              background:
                "radial-gradient(circle at 70% 50%, #f59e0b 0%, #d97706 30%, transparent 60%)",
            }}
          />
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-35"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, #dc2626 0%, #991b1b 30%, transparent 60%)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-[500px] h-[300px] rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle at 50% 100%, #f59e0b 0%, transparent 60%)",
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
                  蜀味坊
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
              <div
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
                    <span className="ml-3 text-sm text-gray-400 group-hover:text-gray-900 transition-colors">
                      搜索商品...
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer group">
                    <span className="text-sm text-gray-400 group-hover:text-gray-900 transition-colors">
                      全部分类
                    </span>
                  </div>
                  {/* Search Orb — Gold */}
                  <Link
                    href="/products"
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
                  </Link>
                </div>
              </div>

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
            background: "linear-gradient(to top, #1a0a0a 0%, transparent 100%)",
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
              精选四川各地特产，满足您的味蕾
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className={`group relative overflow-hidden rounded-2xl bg-white border p-6 md:p-7 text-center transition-all duration-300 cursor-pointer ${
                  hoveredCategory === cat.id
                    ? "border-[var(--color-primary)]/20 shadow-[0_8px_30px_rgba(185,28,28,0.08),0_2px_8px_rgba(185,28,28,0.04)] -translate-y-[3px]"
                    : "border-[var(--color-hairline)] shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)]"
                }`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${0.1 + index * 0.08}s both`,
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
                  <span
                    className={`text-4xl md:text-5xl block mb-3 transition-transform duration-300 ${
                      hoveredCategory === cat.id ? "scale-110" : ""
                    }`}
                  >
                    {cat.icon}
                  </span>
                  <h3
                    className={`text-sm font-semibold mb-1.5 leading-relaxed line-clamp-2 transition-colors ${
                      hoveredCategory === cat.id
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-ink)]"
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[var(--color-primary)] rounded-full transition-all duration-300 ${
                    hoveredCategory === cat.id ? "w-12" : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Featured Products — Dark tile + Gold ornaments */}
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
                FEATURED
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
            {featuredProducts.slice(0, 8).map((product, index) => (
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
                  <div className="rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 aspect-square flex items-center justify-center overflow-hidden">
                    <span className="text-7xl animate-float">🌶️</span>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-accent)]/5 aspect-[4/3] flex items-center justify-center overflow-hidden">
                    <span className="text-5xl">🫕</span>
                  </div>
                </div>
                <div className="space-y-3 pt-8">
                  <div className="rounded-2xl bg-gradient-to-br from-[var(--color-primary-deep)]/10 to-[var(--color-primary-deep)]/5 aspect-[3/4] flex items-center justify-center overflow-hidden">
                    <span className="text-6xl">🥟</span>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/5 aspect-square flex items-center justify-center overflow-hidden">
                    <span className="text-5xl">🍵</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white rounded-2xl shadow-lg px-5 py-3 border border-[var(--color-hairline)]">
                <div className="text-sm font-semibold text-[var(--color-ink)]">30+ 年</div>
                <div className="text-xs text-[var(--color-muted)]">传统工艺传承</div>
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
                蜀味坊诞生于四川成都，深耕四川特产行业十余年。我们走遍巴蜀大地，从郫县豆瓣到汉源花椒，
                从自贡冷吃兔到峨眉山茶，只为寻找最地道的四川味道。
              </p>
              <p className="text-[var(--color-muted)] leading-relaxed mb-8">
                每一份产品都经过严格筛选，确保正宗品质。我们相信，真正的四川味道，
                能让每个人感受到巴蜀大地的热情与魅力。
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
      {/* All Products Section — White + Red ornaments */}
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
              ALL PRODUCTS
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] tracking-[-0.02em] mb-3">
              全部商品
            </h2>
            <p className="text-[var(--color-muted)] text-base md:text-lg max-w-lg mx-auto">
              丰富多样的四川特产，总有一款适合您
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((product, index) => (
              <div key={product.id} style={{ animation: `fadeInUp 0.5s ease-out ${0.05 + index * 0.03}s both` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Features Section — Dark + Gold ornaments */}
      {/* ============================================ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1a0a0a" }}
      >
        <div className="ornament-container">
          <CornerOrnament className="ornament ornament-tl ornament-gold" />
          <CornerOrnament className="ornament ornament-tr ornament-gold" />
          <CornerOrnament className="ornament ornament-bl ornament-gold" />
          <CornerOrnament className="ornament ornament-br ornament-gold" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: "30px 30px",
          }}
        />

        <div className="container-airbnb relative py-20 md:py-24">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium mb-3 tracking-wide" style={{ color: "#f59e0b" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              WHY CHOOSE US
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] mb-3 text-white">
              为什么选择蜀味坊
            </h2>
            <p className="text-base md:text-lg max-w-lg mx-auto" style={{ color: "rgba(255, 255, 255, 0.55)" }}>
              用心做好每一份产品，让您买得放心，吃得安心
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: "🚚", title: "全国包邮", desc: "满99元包邮到家" },
              { icon: "🔒", title: "品质保证", desc: "精选正宗四川特产" },
              { icon: "🔄", title: "无忧退换", desc: "7天无理由退换" },
              { icon: "💬", title: "在线客服", desc: "贴心服务随时响应" },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border p-6 md:p-8 text-center transition-all duration-300"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  animation: `fadeInUp 0.5s ease-out ${0.1 + index * 0.1}s both`,
                }}
              >
                <div className="relative">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-base font-semibold mb-1.5 text-white">{feature.title}</h3>
                  <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Newsletter / CTA Section — Warm + Red ornaments */}
      {/* ============================================ */}
      <section className="relative bg-[var(--color-canvas-warm)] overflow-hidden">
        <div className="border-ornament-top" />

        <div className="ornament-container">
          <CornerOrnament className="ornament ornament-tl ornament-red" />
          <CornerOrnament className="ornament ornament-tr ornament-red" />
          <CornerOrnament className="ornament ornament-bl ornament-red" />
          <CornerOrnament className="ornament ornament-br ornament-red" />
        </div>

        <div className="absolute inset-0">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #b91c1c 0%, transparent 70%)" }}
          />
        </div>

        <div className="container-airbnb relative py-20 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] mb-3 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              STAY CONNECTED
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-ink)] tracking-[-0.02em] mb-4">
              开启四川美食之旅
            </h2>
            <p className="text-[var(--color-muted)] text-base md:text-lg mb-8 max-w-md mx-auto">
              订阅我们的资讯，第一时间获取新品上架和优惠活动信息
            </p>

            <div className="flex items-center gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="输入您的邮箱地址"
                  className="w-full px-5 py-3.5 rounded-full bg-white border border-[var(--color-hairline)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all"
                />
              </div>
              <button className="btn-pill shrink-0 px-6 py-3.5 text-sm shadow-lg shadow-[var(--color-primary)]/20">
                订阅
              </button>
            </div>
            <p className="text-xs text-[var(--color-muted-soft)] mt-4">
              我们尊重您的隐私，绝不会发送垃圾邮件
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
