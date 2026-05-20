import Link from "next/link";
import { categories } from "@/data/products";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-surface-soft)] border-t border-[var(--color-hairline-soft)] mt-auto">
      <div className="container-airbnb py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌶️</span>
              <span className="text-lg font-bold text-[var(--color-ink)]">川名堂上地华联店</span>
            </Link>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              传承四川味道，精选地道特产。<br />
              从火锅底料到特色小吃，<br />
              让您足不出户品味巴蜀风情。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-4">快速链接</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
                  全部商品
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
                  购物车
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
                  关于我们
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-4">商品分类</h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.id}`}
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-4">联系我们</h3>
            <ul className="space-y-3 text-sm text-[var(--color-muted)]">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>18511865525</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>北京市海淀区上地华联购物中心</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🕐</span>
                <span>周一至周日 9:00-21:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--color-hairline-soft)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-muted-soft)]">
            © 2026 川名堂上地华联店 版权所有 | 蜀ICP备2026XXXXXX号
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--color-muted-soft)]">🌶️ 用心传承四川味道</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
