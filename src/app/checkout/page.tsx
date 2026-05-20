"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const categoryEmoji: Record<string, string> = {
  baijiu: "🍶", red_wine: "🍷", other_wine: "🍸",
  green_tea: "🍵", black_tea: "🍵", flower_tea: "🌺", tibetan_tea: "🍵",
  meat_snack: "🥩", veggie_snack: "🥬", candy: "🍬",
  table_seasoning: "🧂", cooking_seasoning: "🍳",
  dried_goods: "🥜", other_food: "🍱", tea_set: "🫖", other: "📦",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const shipping = subtotal >= 99 ? 0 : 15;
  const total = subtotal + (deliveryType === "delivery" ? shipping : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim()) { setError("请输入姓名"); return; }
    if (!phone.trim() || !/^1\d{10}$/.test(phone)) { setError("请输入正确的手机号"); return; }
    if (deliveryType === "delivery" && !address.trim()) { setError("请输入收货地址"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          delivery_type: deliveryType,
          items: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            category: item.category,
          })),
          total,
          note: note.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "提交订单失败");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order/${data.order.id}`);
    } catch {
      setError("网络错误，请稍后重试");
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="section">
        <div className="container-airbnb text-center py-20">
          <span className="text-6xl block mb-4">🛒</span>
          <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2">购物车是空的</h3>
          <p className="text-[var(--color-muted)] mb-6">请先添加商品到购物车</p>
          <Link href="/products" className="btn-primary inline-flex">去逛逛</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container-airbnb max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-8">
          📋 填写订单
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 配送方式 */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-4">配送方式</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType("delivery")}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-center transition-all ${
                  deliveryType === "delivery"
                    ? "border-[var(--color-primary)] bg-red-50 text-[var(--color-primary)] font-semibold"
                    : "border-[var(--color-hairline)] text-[var(--color-muted)]"
                }`}
              >
                🚚 快递到家
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("pickup")}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-center transition-all ${
                  deliveryType === "pickup"
                    ? "border-[var(--color-primary)] bg-red-50 text-[var(--color-primary)] font-semibold"
                    : "border-[var(--color-hairline)] text-[var(--color-muted)]"
                }`}
              >
                🚶 到店自提
              </button>
            </div>
          </div>

          {/* 联系信息 */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">联系信息</h2>

            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">姓名 *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="您的姓名"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">手机号 *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="11位手机号"
                maxLength={11}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
              />
            </div>

            {deliveryType === "delivery" && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">收货地址 *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="省/市/区/详细地址"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base resize-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">备注</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="如：希望什么时候送达"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
              />
            </div>
          </div>

          {/* 商品清单 */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-4">商品清单</h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-lg">{categoryEmoji[item.category] || "📦"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)] truncate">{item.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">×{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-ink)]">
                    ¥{(item.price * item.quantity).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 费用汇总 */}
          <div className="card p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">商品小计</span>
                <span className="font-semibold">¥{subtotal.toFixed(1)}</span>
              </div>
              {deliveryType === "delivery" && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">运费</span>
                  <span className="font-semibold text-green-600">
                    {shipping === 0 ? "免运费" : `¥${shipping.toFixed(1)}`}
                  </span>
                </div>
              )}
              <div className="border-t border-[var(--color-hairline-soft)] pt-2 flex justify-between">
                <span className="text-base font-semibold">合计</span>
                <span className="text-xl font-bold text-[var(--color-primary)]">
                  ¥{total.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full text-base py-4 disabled:opacity-50"
          >
            {submitting ? "提交中..." : `提交订单 ¥${total.toFixed(1)}`}
          </button>

          <p className="text-center text-xs text-[var(--color-muted)]">
            提交订单即表示您同意我们的服务条款
          </p>
        </form>
      </div>
    </div>
  );
}
