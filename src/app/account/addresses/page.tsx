"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, getToken } from "@/context/AuthContext";

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

export default function AddressesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formProvince, setFormProvince] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formDistrict, setFormDistrict] = useState("");
  const [formDetail, setFormDetail] = useState("");
  const [formDefault, setFormDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account/addresses");
    }
  }, [user, authLoading, router]);

  const fetchAddresses = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user, fetchAddresses]);

  const resetForm = () => {
    setFormName("");
    setFormPhone("");
    setFormProvince("");
    setFormCity("");
    setFormDistrict("");
    setFormDetail("");
    setFormDefault(false);
    setEditingId(null);
    setError("");
  };

  const openEditForm = (addr: Address) => {
    setFormName(addr.name);
    setFormPhone(addr.phone);
    setFormProvince(addr.province);
    setFormCity(addr.city);
    setFormDistrict(addr.district);
    setFormDetail(addr.detail);
    setFormDefault(addr.is_default === 1);
    setEditingId(addr.id);
    setShowForm(true);
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formName.trim()) { setError("请输入收货人姓名"); return; }
    if (!/^1\d{10}$/.test(formPhone)) { setError("请输入正确的手机号"); return; }
    if (!formDetail.trim()) { setError("请输入详细地址"); return; }

    setSaving(true);
    const token = getToken();
    const body = {
      name: formName.trim(),
      phone: formPhone.trim(),
      province: formProvince.trim(),
      city: formCity.trim(),
      district: formDistrict.trim(),
      detail: formDetail.trim(),
      is_default: formDefault,
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/addresses/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      if (data.success) {
        resetForm();
        setShowForm(false);
        fetchAddresses();
      } else {
        setError(data.error || "保存失败");
      }
    } catch {
      setError("网络错误，请稍后重试");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个地址吗？")) return;
    const token = getToken();
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
      }
    } catch {
      // ignore
    }
  };

  const handleSetDefault = async (id: string) => {
    const token = getToken();
    try {
      const res = await fetch(`/api/addresses/${id}/default`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
      }
    } catch {
      // ignore
    }
  };

  if (authLoading) {
    return (
      <div className="section">
        <div className="container-airbnb text-center py-20">
          <p className="text-[var(--color-muted)]">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="section">
      <div className="container-airbnb max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-ink)]">
            📍 收货地址
          </h1>
          <Link
            href="/account"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            ← 返回个人中心
          </Link>
        </div>

        {/* Address List */}
        {!showForm && (
          <>
            {loading ? (
              <div className="text-center py-16">
                <p className="text-[var(--color-muted)]">加载中...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">📍</span>
                <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2">
                  暂无收货地址
                </h3>
                <p className="text-[var(--color-muted)] mb-6">
                  添加地址后可在结算时快速选择
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {addresses.map((addr) => (
                  <div key={addr.id} className="card p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--color-ink)]">
                          {addr.name}
                        </span>
                        <span className="text-sm text-[var(--color-muted)]">
                          {addr.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                        </span>
                        {addr.is_default === 1 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white font-medium">
                            默认
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-[var(--color-body)] mb-3">
                      {[addr.province, addr.city, addr.district, addr.detail]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <button
                        onClick={() => openEditForm(addr)}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="text-red-500 hover:underline"
                      >
                        删除
                      </button>
                      {addr.is_default !== 1 && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:underline"
                        >
                          设为默认
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="btn-primary w-full text-base py-3.5"
            >
              + 添加新地址
            </button>
          </>
        )}

        {/* Address Form */}
        {showForm && (
          <form onSubmit={handleSave} className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-2">
              {editingId ? "编辑地址" : "添加地址"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
                  收货人 *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="姓名"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
                  手机号 *
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="11位手机号"
                  maxLength={11}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
                  省份
                </label>
                <input
                  type="text"
                  value={formProvince}
                  onChange={(e) => setFormProvince(e.target.value)}
                  placeholder="省"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
                  城市
                </label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="市"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
                  区/县
                </label>
                <input
                  type="text"
                  value={formDistrict}
                  onChange={(e) => setFormDistrict(e.target.value)}
                  placeholder="区/县"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
                详细地址 *
              </label>
              <textarea
                value={formDetail}
                onChange={(e) => setFormDetail(e.target.value)}
                placeholder="街道、门牌号等"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formDefault}
                onChange={(e) => setFormDefault(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-hairline)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-ink)]">设为默认地址</span>
            </label>

            {error && (
              <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { resetForm(); setShowForm(false); }}
                className="flex-1 py-3 rounded-xl border border-[var(--color-hairline)] text-[var(--color-ink)] font-medium text-sm hover:bg-[var(--color-surface-soft)] transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary py-3 disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
