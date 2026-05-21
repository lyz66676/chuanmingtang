"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
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
}

interface Stats {
  pending?: number;
  paid?: number;
  shipped?: number;
  ready?: number;
  completed?: number;
  cancelled?: number;
  today_orders: number;
  today_revenue: number;
  total_orders: number;
}

const statusLabels: Record<string, string> = {
  pending: "待付款",
  paid: "待发货",
  shipped: "已发货",
  ready: "待取货",
  completed: "已完成",
  cancelled: "已取消",
};

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  paid: "text-blue-600 bg-blue-50 border-blue-200",
  shipped: "text-purple-600 bg-purple-50 border-purple-200",
  ready: "text-green-600 bg-green-50 border-green-200",
  completed: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-gray-500 bg-gray-50 border-gray-200",
};

// 新订单提示音（使用 Web Audio API 生成提示音，无需外部文件）
function playNewOrderSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1100;
    osc2.type = "sine";
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.45);
  } catch {
    // 音频不可用时静默失败
  }
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipDialog, setShipDialog] = useState<{ id: string; name: string } | null>(null);
  const [trackingNo, setTrackingNo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const prevOrdersRef = useRef<Order[]>([]);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async (statusFilter = "") => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/admin/orders?status=${statusFilter}`
        : "/api/admin/orders";
      const res = await fetch(url, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // 检测新订单（声音提醒）
        if (prevOrdersRef.current.length > 0 && data.orders.length > prevOrdersRef.current.length) {
          playNewOrderSound();
        }
        prevOrdersRef.current = data.orders;
        setOrders(data.orders);
        setStats(data.stats);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchOrders(filter);
    }
  }, [token, filter, fetchOrders]);

  // 自动刷新（每15秒）
  useEffect(() => {
    if (token && autoRefresh) {
      autoRefreshRef.current = setInterval(() => {
        fetchOrders(filter);
      }, 15000);
    }
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    };
  }, [token, filter, autoRefresh, fetchOrders]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("admin_token", data.token);
      } else {
        setLoginError(data.error || "密码错误");
      }
    } catch {
      setLoginError("登录失败");
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("admin_token");
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }
  };

  const handleShip = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "shipped",
          tracking_no: trackingNo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShipDialog(null);
        setTrackingNo("");
        fetchOrders(filter);
      }
    } catch {
      // ignore
    }
  };

  const handleReady = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "ready" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders(filter);
      }
    } catch {
      // ignore
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "completed" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders(filter);
      }
    } catch {
      // ignore
    }
  };

  const handleMarkPaid = async (id: string) => {
    if (!confirm("确认将该订单标记为已支付？")) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "paid", pay_status: "paid" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders(filter);
      }
    } catch {
      // ignore
    }
  };

  // 搜索过滤
  const filteredOrders = searchQuery.trim()
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customer_name.includes(searchQuery) ||
          o.phone.includes(searchQuery)
      )
    : orders;

  // 登录页
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">🔐 川名堂管理后台</h1>
            <p className="text-sm text-gray-500 mt-2">请输入管理员密码</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="管理员密码"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-lg text-center"
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-sm text-center">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-lg hover:bg-red-700 transition-colors"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.status === "paid").length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-800">🔔 川名堂管理后台</h1>
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                autoRefresh
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
              title={autoRefresh ? "自动刷新已开启（15秒）" : "自动刷新已关闭"}
            >
              {autoRefresh ? "🔄 自动" : "⏸ 暂停"}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            退出
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.paid || 0}</p>
              <p className="text-xs text-gray-500 mt-1">待处理</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.today_orders || 0}</p>
              <p className="text-xs text-gray-500 mt-1">今日订单</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                ¥{(stats.today_revenue || 0).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">今日收入</p>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 搜索订单号、姓名、手机号..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["", "paid", "shipped", "pending", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === s
                  ? "bg-red-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s ? statusLabels[s] || s : "全部"}
              {s === "paid" && pendingCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Order list */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">📭</p>
            <p>{searchQuery ? "未找到匹配的订单" : "暂无订单"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border border-gray-200 p-5 transition-all ${
                    order.status === "paid" ? "ring-2 ring-red-200" : ""
                  }`}
                >
                  {/* Order header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{order.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.created_at}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                        statusColors[order.status] || "text-gray-600 bg-gray-50 border-gray-200"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  {/* Customer info (always visible) */}
                  <div className="text-sm text-gray-600 mb-3 space-y-1">
                    <p>
                      <span className="text-gray-400">👤</span> {order.customer_name} · {order.phone}
                    </p>
                    <p>
                      <span className="text-gray-400">
                        {order.delivery_type === "delivery" ? "🚚" : "🚶"}
                      </span>{" "}
                      {order.delivery_type === "delivery" ? order.address : "到店自提"}
                    </p>
                    {order.note && (
                      <p>
                        <span className="text-gray-400">📝</span> {order.note}
                      </p>
                    )}
                  </div>

                  {/* Expandable details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 pt-3 mb-3 animate-[fadeIn_0.2s_ease]">
                      {/* Items */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-2 font-medium">商品明细</p>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm py-1">
                            <span className="text-gray-700 truncate max-w-[70%]">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="font-semibold text-gray-800">
                              ¥{(item.price * item.quantity).toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Pay status & tracking */}
                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                        <div>
                          <span className="text-gray-400">支付状态：</span>
                          <span className={order.pay_status === "paid" ? "text-green-600" : "text-amber-600"}>
                            {order.pay_status === "paid" ? "已支付" : "未支付"}
                          </span>
                        </div>
                        {order.tracking_no && (
                          <div>
                            <span className="text-gray-400">快递单号：</span>
                            <span>{order.tracking_no}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-4">
                    <span className="text-sm text-gray-500">
                      {order.tracking_no && `快递单号: ${order.tracking_no}`}
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      ¥{order.total.toFixed(1)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {order.status === "pending" && order.pay_status === "unpaid" && (
                      <button
                        onClick={() => handleMarkPaid(order.id)}
                        className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition-colors"
                      >
                        💰 标记已支付
                      </button>
                    )}
                    {order.status === "paid" && order.delivery_type === "delivery" && (
                      <button
                        onClick={() => setShipDialog({ id: order.id, name: order.customer_name })}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors"
                      >
                        📦 发货
                      </button>
                    )}
                    {order.status === "paid" && order.delivery_type === "pickup" && (
                      <button
                        onClick={() => handleReady(order.id)}
                        className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
                      >
                        ✅ 备货完成
                      </button>
                    )}
                    {order.status === "ready" && (
                      <button
                        onClick={() => handleComplete(order.id)}
                        className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
                      >
                        🎉 确认取货
                      </button>
                    )}
                    <a
                      href={`tel:${order.phone}`}
                      className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                      📞 联系
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ship dialog */}
      {shipDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">确认发货</h3>
            <p className="text-sm text-gray-500 mb-4">
              订单 {shipDialog.id} · {shipDialog.name}
            </p>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">快递单号（可选）</label>
              <input
                type="text"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                placeholder="输入快递单号"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShipDialog(null);
                  setTrackingNo("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleShip(shipDialog.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                确认发货
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
