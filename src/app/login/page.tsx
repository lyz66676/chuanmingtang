"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      setError("请输入正确的11位手机号");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setCodeSent(true);
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        // 开发模式自动填入验证码
        if (data.dev_code) {
          setCode(data.dev_code);
        }
      } else {
        setError(data.error || "发送验证码失败");
      }
    } catch {
      setError("网络错误，请稍后重试");
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^1\d{10}$/.test(phone)) {
      setError("请输入正确的手机号");
      return;
    }
    if (!code.trim()) {
      setError("请输入验证码");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const success = await login(phone, code);
      if (success) {
        // 登录成功，跳转到来源页或首页
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/";
        router.push(redirect);
      } else {
        setError("验证码错误或已过期");
      }
    } catch {
      setError("登录失败，请稍后重试");
    }
    setLoading(false);
  };

  return (
    <div className="section min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="container-airbnb max-w-md mx-auto">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-5xl block mb-3">🌶️</span>
            <h1 className="text-2xl font-bold text-[var(--color-ink)]">登录 / 注册</h1>
            <p className="text-sm text-[var(--color-muted)] mt-2">
              使用手机号验证码快速登录
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                手机号
              </label>
              <div className="flex gap-3">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入11位手机号"
                  maxLength={11}
                  className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading || countdown > 0 || !/^1\d{10}$/.test(phone)}
                  className="shrink-0 px-4 py-3 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] font-medium text-sm hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </button>
              </div>
            </div>

            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                验证码
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="请输入6位验证码"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base text-center text-lg tracking-[0.5em]"
              />
              {codeSent && (
                <p className="text-xs text-[var(--color-muted)] mt-1.5">
                  开发模式验证码已自动填入
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn-primary w-full text-base py-3.5 disabled:opacity-50"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[var(--color-muted)]">
              登录即表示您同意
              <Link href="/about" className="text-[var(--color-primary)] hover:underline mx-1">
                服务条款
              </Link>
              和
              <Link href="/about" className="text-[var(--color-primary)] hover:underline mx-1">
                隐私政策
              </Link>
            </p>
          </div>

          {/* Back link */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
