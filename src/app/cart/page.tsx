import Link from "next/link";
import { products } from "@/data/products";

export default function CartPage() {
  // Static cart display - will be interactive in Phase 3
  const cartItems = products.slice(0, 3);

  return (
    <div className="section">
      <div className="container-airbnb">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-2">
            🛒 购物车
          </h1>
          <p className="text-[var(--color-muted)]">
            管理您的购物车商品
          </p>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const categoryIcon =
                  item.category === "hotpot" ? "🫕" :
                  item.category === "chili" ? "🌶️" :
                  item.category === "snack" ? "🥟" :
                  item.category === "seasoning" ? "🧂" :
                  item.category === "preserved" ? "🥩" : "🍵";

                return (
                  <div
                    key={item.id}
                    className="card flex gap-4 p-4"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-[14px] bg-[var(--color-surface-soft)] flex items-center justify-center shrink-0">
                      <span className="text-4xl">{categoryIcon}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.id}`}
                        className="text-sm font-semibold text-[var(--color-ink)] hover:underline line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-[var(--color-muted)] mt-1">
                        {item.subcategory}
                      </p>

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-[var(--color-primary)]">
                          ¥{item.price.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 rounded-lg border border-[var(--color-hairline)] flex items-center justify-center hover:bg-[var(--color-surface-soft)] transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">1</span>
                          <button className="w-8 h-8 rounded-lg border border-[var(--color-hairline)] flex items-center justify-center hover:bg-[var(--color-surface-soft)] transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete */}
                    <button className="self-start p-1 rounded-full hover:bg-[var(--color-surface-soft)] transition-colors">
                      <svg className="w-5 h-5 text-[var(--color-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-4">
                  订单摘要
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-muted)]">商品小计</span>
                    <span className="font-semibold text-[var(--color-ink)]">
                      ¥{cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-muted)]">运费</span>
                    <span className="font-semibold text-green-600">免运费</span>
                  </div>
                  <div className="border-t border-[var(--color-hairline-soft)] pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-[var(--color-ink)]">合计</span>
                      <span className="text-xl font-bold text-[var(--color-primary)]">
                        ¥{cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="btn-primary w-full text-base">
                  去结算
                </button>

                <Link
                  href="/products"
                  className="block text-center text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] mt-3 transition-colors"
                >
                  继续购物
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🛒</span>
            <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2">
              购物车是空的
            </h3>
            <p className="text-[var(--color-muted)] mb-6">
              快去挑选心仪的四川特产吧！
            </p>
            <Link href="/products" className="btn-primary inline-flex">
              去逛逛
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
