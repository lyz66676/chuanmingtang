import Link from "next/link";

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#b91c1c] to-[#dc2626] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-8xl">🌶️</div>
          <div className="absolute bottom-10 left-10 text-8xl">🏔️</div>
        </div>
        <div className="container-airbnb relative z-10 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            关于川名堂
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            传承四川味道，让世界爱上巴蜀美食
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section bg-white">
        <div className="container-airbnb">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-6 text-center">
              我们的故事
            </h2>
            <div className="space-y-4 text-[var(--color-body)] leading-relaxed">
              <p>
                川名堂诞生于四川成都，一个被美食浸润的城市。我们深知，真正的四川味道不仅仅是麻辣，
                更是一种文化的传承，一种生活的态度。
              </p>
              <p>
                从郫县豆瓣酱的百年工艺，到汉源花椒的麻香四溢；从自贡冷吃兔的鲜香麻辣，
                到灯影牛肉的薄脆化渣——每一道特产背后，都凝聚着四川人民的智慧与匠心。
              </p>
              <p>
                我们走遍四川各地，寻找最地道、最优质的特色美食。与当地老字号合作，
                严格把控品质，只为将最正宗的四川味道送到您的餐桌。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-[var(--color-surface-soft)]">
        <div className="container-airbnb">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-10 text-center">
            我们的承诺
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: "🌶️",
                title: "地道正宗",
                desc: "所有商品均来自四川原产地，严格筛选，确保每一口都是正宗四川味道。",
              },
              {
                icon: "🤝",
                title: "品质保证",
                desc: "与当地老字号和优质供应商合作，从源头把控品质，让您买得放心。",
              },
              {
                icon: "❤️",
                title: "用心服务",
                desc: "从选品到配送，我们用心对待每一个环节，为您提供最贴心的购物体验。",
              },
            ].map((value) => (
              <div key={value.title} className="card p-8 text-center">
                <span className="text-5xl block mb-4">{value.icon}</span>
                <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Section */}
      <section className="section bg-white">
        <div className="container-airbnb">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-6 text-center">
              四川 · 美食之都
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: "🫕", name: "火锅", desc: "麻辣鲜香" },
                { icon: "🌶️", name: "辣椒", desc: "二荆条" },
                { icon: "🧂", name: "豆瓣", desc: "郫县酱" },
                { icon: "🥟", name: "小吃", desc: "种类多" },
              ].map((item) => (
                <div key={item.name} className="card p-6 text-center">
                  <span className="text-4xl block mb-2">{item.icon}</span>
                  <h4 className="text-sm font-semibold text-[var(--color-ink)]">{item.name}</h4>
                  <p className="text-xs text-[var(--color-muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[var(--color-body)] leading-relaxed text-center">
              四川，被誉为"天府之国"，不仅拥有壮丽的自然风光，更是中国美食的重要发源地。
              川菜以其独特的麻辣风味闻名于世，而四川的特产更是将这种风味发挥到了极致。
              川名堂致力于将这些美味带到千家万户，让更多人感受四川美食的魅力。
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section bg-white">
        <div className="container-airbnb">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-8">
              联系我们
            </h2>
            <div className="card p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-xl font-semibold text-[var(--color-ink)]">18511865525</span>
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                周一至周日 9:00 - 21:00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-[#b91c1c] to-[#dc2626] text-white">
        <div className="container-airbnb text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            开始您的四川美食之旅
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            精选四川特产，从川名堂开始。让每一顿饭都充满巴蜀风情。
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#b91c1c] font-semibold hover:bg-white/90 transition-colors"
          >
            立即选购
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
