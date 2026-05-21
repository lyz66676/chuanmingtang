"use client";

import Link from "next/link";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth, getToken } from "@/context/AuthContext";

const categoryEmoji: Record<string, string> = {
  baijiu: "🍶", red_wine: "🍷", other_wine: "🍸",
  green_tea: "🍵", black_tea: "🍵", flower_tea: "🌺", tibetan_tea: "🍵",
  meat_snack: "🥩", veggie_snack: "🥬", candy: "🍬",
  table_seasoning: "🧂", cooking_seasoning: "🍳",
  dried_goods: "🥜", other_food: "🍱", tea_set: "🫖", other: "📦",
};

interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  is_default: number;
}

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "1";
  const { items: cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // "立即购买"模式：从 localStorage 读取商品数据
  const buyNowItems = useMemo(() => {
    if (!isBuyNow) return null;
    try {
      const stored = localStorage.getItem("buyNowItem");
      const total = localStorage.getItem("buyNowTotal");
      if (stored && total) {
        return {
          items: [JSON.parse(stored)],
          total: Number(total),
        };
      }
    } catch {
      // ignore
    }
    return null;
  }, [isBuyNow]);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 实际使用的商品列表和金额（放在 useState 之后）
  const checkoutItems = isBuyNow && buyNowItems ? buyNowItems.items : cartItems;
  const checkoutSubtotal = isBuyNow && buyNowItems ? buyNowItems.total : subtotal;
  const shipping = checkoutSubtotal >= 99 ? 0 : 15;
  const total = checkoutSubtotal + (deliveryType === "delivery" ? shipping : 0);

  // Address selector state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;
    fetch("/api/addresses", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSavedAddresses(data.addresses);
          // Auto-select default address
          const defaultAddr = data.addresses.find((a: Address) => a.is_default === 1);
          if (defaultAddr) {
            selectAddress(defaultAddr);
          }
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selectAddress = (addr: Address) => {
    setCustomerName(addr.name);
    setPhone(addr.phone);
    setAddress([addr.province, addr.city, addr.district, addr.detail].filter(Boolean).join(" "));
    setSelectedAddressId(addr.id);
    setShowAddressPicker(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim()) { setError("请输入姓名"); return; }
    if (!phone.trim() || !/^1\d{10}$/.test(phone)) { setError("请输入正确的手机号"); return; }
    if (deliveryType === "delivery" && !address.trim()) { setError("请输入收货地址"); return; }

    setSubmitting(true);
    try {
      const token = getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          delivery_type: deliveryType,
          items: checkoutItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            category: item.category,
          })),
          total,
          note: note.trim(),
          user_id: user?.id || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "提交订单失败");
        setSubmitting(false);
        return;
      }

      if (!isBuyNow) {
        clearCart();
      } else {
        // 清除"立即购买"的临时数据
        localStorage.removeItem("buyNowItem");
        localStorage.removeItem("buyNowTotal");
      }
      router.push(`/order/${data.order.id}`);
    } catch {
      setError("网络错误，请稍后重试");
      setSubmitting(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="section">
        <div className="container-airbnb text-center py-20">
          <span className="text-6xl block mb-4">🛒</span>
          <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2">
            {isBuyNow ? "商品信息已过期" : "购物车是空的"}
          </h3>
          <p className="text-[var(--color-muted)] mb-6">
            {isBuyNow ? "请重新选择商品" : "请先添加商品到购物车"}
          </p>
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

            {/* Saved Addresses (for logged-in users) */}
            {user && savedAddresses.length > 0 && deliveryType === "delivery" && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
                  选择收货地址
                </label>
                <div className="space-y-2">
                  {savedAddresses.slice(0, 3).map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => selectAddress(addr)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedAddressId === addr.id
                          ? "border-[var(--color-primary)] bg-red-50"
                          : "border-[var(--color-hairline)] hover:border-[var(--color-muted)]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-[var(--color-ink)]">{addr.name}</span>
                        <span className="text-xs text-[var(--color-muted)]">{addr.phone}</span>
                        {addr.is_default === 1 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-primary)] text-white">
                            默认
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">
                        {[addr.province, addr.city, addr.district, addr.detail].filter(Boolean).join(" ")}
                      </p>
                    </button>
                  ))}
                  {savedAddresses.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressPicker(!showAddressPicker)}
                      className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                      {showAddressPicker ? "收起" : `查看全部 ${savedAddresses.length} 个地址`}
                    </button>
                  )}
                  {showAddressPicker && (
                    <div className="space-y-2 mt-2">
                      {savedAddresses.slice(3).map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => selectAddress(addr)}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                            selectedAddressId === addr.id
                              ? "border-[var(--color-primary)] bg-red-50"
                              : "border-[var(--color-hairline)] hover:border-[var(--color-muted)]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-[var(--color-ink)]">{addr.name}</span>
                            <span className="text-xs text-[var(--color-muted)]">{addr.phone}</span>
                          </div>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">
                            {[addr.province, addr.city, addr.district, addr.detail].filter(Boolean).join(" ")}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                  <Link
                    href="/account/addresses"
                    className="inline-block text-sm text-[var(--color-primary)] hover:underline"
                  >
                    管理地址 →
                  </Link>
                </div>
              </div>
            )}

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
              {checkoutItems.map((item) => (
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
                <span className="font-semibold">¥{checkoutSubtotal.toFixed(1)}</span>
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="section">
        <div className="container-airbnb text-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">加载中...</p>
        </div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
