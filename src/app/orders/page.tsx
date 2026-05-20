"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

interface Order {
  id: string;
  total: number;
  status: string;
  delivery_type: "delivery" | "pickup";
  items: { name: string; quantity: number }[];
  created_at: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "待付款", color: "text-amber-600 bg-amber-50" },
  paid: { label: "待发货", color: "text-blue-600 bg-blue-50" },
  shipped: { label: "已发货", color: "text-purple-600 bg-purple-50" },
  ready: { label: "待取货", color: "text-green-600 bg-green-50" },
  completed: { label: "已完成", color: "text-green-600 bg-green-50" },
  cancelled: { label: "已取消", color: "text-gray-500 bg-gray-50" },
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !/^1\d{10}$/.test(phone)) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/query?phone=${phone.trim()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <div className="section">
      <div className="container-airbnb max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-8">
          📋 我的订单
        </h1>

        {/* 搜索 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="输入手机号查询订单"
              maxLength={11}
              className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            />
            <button
              type="submit"
              disabled={loading || !/^1\d{10}$/.test(phone)}
              className="btn-primary px-6 disabled:opacity-50"
            >
              {loading ? "查询中..." : "查询"}
            </button>
          </div>
        </form>

        {/* 订单列表 */}
        {searched && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">📭</span>
                <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2">暂无订单</h3>
                <p className="text-[var(--color-muted)] mb-6">该手机号暂无订单记录</p>
                <Link href="/products" className="btn-primary inline-flex">去逛逛</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusInfo = statusMap[order.status] || { label: order.status, color: "text-gray-600 bg-gray-50" };
                  const itemSummary = order.items.map((i) => `${i.name}×${i.quantity}`).join("、");
                  return (
                    <Link
                      key={order.id}
                      href={`/order/${order.id}`}
                      className="card p-5 block hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-ink)]">{order.id}</p>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">{order.created_at}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-muted)] truncate mb-3">{itemSummary}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-muted)]">
                          {order.delivery_type === "delivery" ? "🚚 快递" : "🚶 自提"}
                        </span>
                        <span className="text-lg font-bold text-[var(--color-primary)]">
                          ¥{order.total.toFixed(1)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* 未搜索提示 */}
        {!searched && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-[var(--color-muted)]">输入下单时填写的手机号查询订单</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="section"><div className="container-airbnb text-center py-20"><p>加载中...</p></div></div>}>
      <OrdersContent />
    </Suspense>
  );
}
