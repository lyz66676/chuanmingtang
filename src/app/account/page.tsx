"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/account");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("cmt_token");
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        refreshUser();
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
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

  if (!user) {
    return null; // will redirect
  }

  const menuItems = [
    { href: "/account/addresses", icon: "📍", label: "收货地址" },
    { href: "/orders", icon: "📋", label: "我的订单" },
  ];

  return (
    <div className="section">
      <div className="container-airbnb max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-8">
          👤 个人中心
        </h1>

        {/* User Info Card */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-2xl font-bold">
              {(user.name || user.phone)[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                {user.name || "未设置昵称"}
              </h2>
              <p className="text-sm text-[var(--color-muted)]">
                {user.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Name */}
        <div className="card p-6 mb-6">
          <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-3">修改昵称</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入昵称"
              maxLength={20}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            />
            <button
              onClick={handleSaveName}
              disabled={saving || !name.trim()}
              className="btn-primary px-6 disabled:opacity-50"
            >
              {saving ? "保存中..." : saved ? "✓ 已保存" : "保存"}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="card p-4 mb-6">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-2 py-4 ${
                index < menuItems.length - 1
                  ? "border-b border-[var(--color-hairline-soft)]"
                  : ""
              } hover:bg-[var(--color-surface-soft)] rounded-lg transition-colors`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 text-sm font-medium text-[var(--color-ink)]">
                {item.label}
              </span>
              <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl border border-red-200 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
