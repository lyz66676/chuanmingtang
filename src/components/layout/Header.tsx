"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalCount } = useCart();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--color-hairline-soft)]">
      <div className="container-airbnb">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🌶️</span>
            <span className="text-lg md:text-xl font-bold text-[var(--color-ink)] tracking-tight">
              川名堂
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-semibold text-[var(--color-ink)] rounded-full hover:bg-[var(--color-surface-soft)] transition-colors"
            >
              首页
            </Link>
            <Link
              href="/products"
              className="px-4 py-2 text-sm font-semibold text-[var(--color-ink)] rounded-full hover:bg-[var(--color-surface-soft)] transition-colors"
            >
              全部商品
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="px-4 py-2 text-sm font-semibold text-[var(--color-ink)] rounded-full hover:bg-[var(--color-surface-soft)] transition-colors"
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* User Account */}
            {user ? (
              <Link
                href="/account"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[var(--color-surface-soft)] transition-colors text-sm font-medium text-[var(--color-ink)]"
              >
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">
                  {(user.name || user.phone)[0]}
                </span>
                <span className="max-w-[80px] truncate">{user.name || user.phone}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex px-4 py-1.5 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-medium hover:bg-red-50 transition-colors"
              >
                登录
              </Link>
            )}

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-full hover:bg-[var(--color-surface-soft)] transition-colors"
              aria-label="搜索"
            >
              <svg className="w-5 h-5 text-[var(--color-ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="p-2.5 rounded-full hover:bg-[var(--color-surface-soft)] transition-colors relative"
              aria-label="购物车"
            >
              <svg className="w-5 h-5 text-[var(--color-ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold leading-none px-1">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-full hover:bg-[var(--color-surface-soft)] transition-colors"
              aria-label="菜单"
            >
              <svg className="w-5 h-5 text-[var(--color-ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="pb-4 animate-[fadeIn_0.2s_ease]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索四川特产..."
                className="w-full h-12 pl-12 pr-4 text-base rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] focus:outline-none focus:border-[var(--color-border-strong)] focus:bg-white transition-colors"
                autoFocus
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-[var(--color-hairline-soft)] pt-4 animate-[fadeIn_0.2s_ease]">
            <div className="flex flex-col gap-1">
              {/* Mobile User Section */}
              {user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--color-surface-soft)] transition-colors border-b border-[var(--color-hairline-soft)] mb-1 pb-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
                    {(user.name || user.phone)[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                      {user.name || "用户"}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {user.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl hover:bg-[var(--color-surface-soft)] transition-colors border-b border-[var(--color-hairline-soft)] mb-1 pb-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm">👤</span>
                  <span>登录 / 注册</span>
                </Link>
              )}
              <Link
                href="/"
                className="px-4 py-3 text-sm font-semibold rounded-xl hover:bg-[var(--color-surface-soft)] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 首页
              </Link>
              <Link
                href="/products"
                className="px-4 py-3 text-sm font-semibold rounded-xl hover:bg-[var(--color-surface-soft)] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                📋 全部商品
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="px-4 py-3 text-sm font-semibold rounded-xl hover:bg-[var(--color-surface-soft)] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
              <Link
                href="/about"
                className="px-4 py-3 text-sm font-semibold rounded-xl hover:bg-[var(--color-surface-soft)] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                📖 关于我们
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
