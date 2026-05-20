"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  delivery_type: "delivery" | "pickup";
  items: OrderItem[];
  total: number;
  status: string;
  note: string;
  tracking_no: string;
  pay_status: string;
  created_at: string;
  updated_at: string;
}

const statusMap: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "待付款", color: "text-amber-600 bg-amber-50", icon: "⏳" },
  paid: { label: "待发货", color: "text-blue-600 bg-blue-50", icon: "📦" },
  shipped: { label: "已发货", color: "text-purple-600 bg-purple-50", icon: "🚚" },
  ready: { label: "待取货", color: "text-green-600 bg-green-50", icon: "✅" },
  completed: { label: "已完成", color: "text-green-600 bg-green-50", icon: "🎉" },
  cancelled: { label: "已取消", color: "text-gray-500 bg-gray-50", icon: "❌" },
};

const statusSteps = [
  { key: "pending", label: "提交订单" },
  { key: "paid", label: "已付款" },
  { key: "shipped", label: "已发货" },
  { key: "completed", label: "已完成" },
];

const statusStepsPickup = [
  { key: "pending", label: "提交订单" },
  { key: "paid", label: "已付款" },
  { key: "ready", label: "备货完成" },
  { key: "completed", label: "已取货" },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || "订单不存在");
        }
      })
      .catch(() => setError("加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch {
      // ignore
    }
    setConfirming(false);
  };

  if (loading) {
    return (
      <div className="section">
        <div className="container-airbnb text-center py-20">
          <p className="text-[var(--color-muted)]">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="section">
        <div className="container-airbnb text-center py-20">
          <span className="text-6xl block mb-4">😅</span>
          <h3 className="text-lg font-semibold mb-2">订单不存在</h3>
          <p className="text-[var(--color-muted)] mb-6">{error}</p>
          <Link href="/" className="btn-primary inline-flex">返回首页</Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusMap[order.status] || { label: order.status, color: "text-gray-600 bg-gray-50", icon: "📋" };
  const steps = order.delivery_type === "pickup" ? statusStepsPickup : statusSteps;

  return (
    <div className="section">
      <div className="container-airbnb max-w-3xl mx-auto">
        {/* 成功提示 */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-8">
          <span className="text-5xl block mb-3">🎉</span>
          <h1 className="text-2xl font-bold text-green-800 mb-1">订单提交成功！</h1>
          <p className="text-green-600">订单号：{order.id}</p>
        </div>

        {/* 订单状态 */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{statusInfo.icon}</span>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                下单时间：{order.created_at}
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const stepKeys = steps.map((s) => s.key);
              const currentIdx = stepKeys.indexOf(order.status);
              const isDone = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={step.key} className="flex-1 text-center relative">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${
                      isDone ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-red-100" : ""}`}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <p className={`text-xs mt-1 ${isDone ? "text-[var(--color-ink)] font-medium" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  {i < steps.length - 1 && (
                    <div
                      className={`absolute top-4 left-[60%] right-[-40%] h-0.5 ${
                        isDone && i < currentIdx ? "bg-[var(--color-primary)]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 配送信息 */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-4">
            {order.delivery_type === "delivery" ? "🚚 配送信息" : "🚶 自提信息"}
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">联系人</span>
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">电话</span>
              <span className="font-medium">{order.phone}</span>
            </div>
            {order.delivery_type === "delivery" && (
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">地址</span>
                <span className="font-medium text-right max-w-[60%]">{order.address}</span>
              </div>
            )}
            {order.tracking_no && (
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">快递单号</span>
                <span className="font-medium">{order.tracking_no}</span>
              </div>
            )}
            {order.note && (
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">备注</span>
                <span className="font-medium">{order.note}</span>
              </div>
            )}
          </div>
        </div>

        {/* 商品清单 */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-4">📋 商品清单</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-soft)] overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-ink)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">×{item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">¥{(item.price * item.quantity).toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--color-hairline-soft)] mt-4 pt-4 flex justify-between">
            <span className="font-semibold">合计</span>
            <span className="text-xl font-bold text-[var(--color-primary)]">¥{order.total.toFixed(1)}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          {order.status === "shipped" && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="btn-primary w-full text-base py-3"
            >
              {confirming ? "确认中..." : "确认收货"}
            </button>
          )}

          <Link
            href={`/orders?phone=${order.phone}`}
            className="block w-full text-center py-3 rounded-xl border border-[var(--color-hairline)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)] transition-colors"
          >
            查看全部订单
          </Link>

          <Link
            href="/"
            className="block w-full text-center py-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
