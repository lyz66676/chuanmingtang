"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithPassword, setUserPassword } = useAuth();

  // Tab 切换: "code" = 验证码登录, "password" = 密码登录
  const [tab, setTab] = useState<"code" | "password">("code");

  // 通用
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 验证码模式
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 密码模式
  const [pwd, setPwd] = useState("");

  // 设置密码弹窗
  const [showSetPwd, setShowSetPwd] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [setPwdLoading, setSetPwdLoading] = useState(false);
  const [setPwdError, setSetPwdError] = useState("");
  // 记住验证码登录成功后的 phone/code，用于 set-password API
  const [lastLoginPhone, setLastLoginPhone] = useState("");
  const [lastLoginCode, setLastLoginCode] = useState("");

  // ── 发送验证码 ──
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

  // ── 验证码登录 ──
  const handleCodeLogin = async (e: React.FormEvent) => {
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
      const result = await login(phone, code);
      if (result.success) {
        // 如果用户尚未设置密码，弹出设置密码窗口
        if (!result.hasPassword) {
          setLastLoginPhone(phone);
          setLastLoginCode(code);
          setShowSetPwd(true);
        } else {
          // 已有密码，直接跳转
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect") || "/";
          router.push(redirect);
        }
      } else {
        setError("验证码错误或已过期");
      }
    } catch {
      setError("登录失败，请稍后重试");
    }
    setLoading(false);
  };

  // ── 密码登录 ──
  const handlePwdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^1\d{10}$/.test(phone)) {
      setError("请输入正确的手机号");
      return;
    }
    if (!/^\d{6}$/.test(pwd)) {
      setError("请输入6位数字密码");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const success = await loginWithPassword(phone, pwd);
      if (success) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/";
        router.push(redirect);
      } else {
        setError("手机号或密码错误");
      }
    } catch {
      setError("登录失败，请稍后重试");
    }
    setLoading(false);
  };

  // ── 设置密码 ──
  const handleSetPassword = async () => {
    if (!/^\d{6}$/.test(newPwd)) {
      setSetPwdError("请输入6位数字密码");
      return;
    }
    setSetPwdError("");
    setSetPwdLoading(true);
    try {
      const success = await setUserPassword(lastLoginPhone, lastLoginCode, newPwd);
      if (success) {
        // 密码设置成功，跳转
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/";
        router.push(redirect);
      } else {
        setSetPwdError("设置密码失败，请稍后重试");
      }
    } catch {
      setSetPwdError("网络错误，请稍后重试");
    }
    setSetPwdLoading(false);
  };

  const handleSkipSetPassword = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || "/";
    router.push(redirect);
  };

  // ── 切换到验证码模式（忘记密码时） ──
  const switchToCodeTab = () => {
    setTab("code");
    setError("");
    setPwd("");
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
              使用手机号快速登录
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setTab("code"); setError(""); setPwd(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                tab === "code"
                  ? "bg-white text-[var(--color-ink)] shadow-sm"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              短信验证码登录
            </button>
            <button
              onClick={() => { setTab("password"); setError(""); setCode(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                tab === "password"
                  ? "bg-white text-[var(--color-ink)] shadow-sm"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              密码登录
            </button>
          </div>

          {/* ── 验证码登录表单 ── */}
          {tab === "code" && (
            <form onSubmit={handleCodeLogin} className="space-y-5">
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
                    验证码已发送，请查收短信
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
          )}

          {/* ── 密码登录表单 ── */}
          {tab === "password" && (
            <form onSubmit={handlePwdLogin} className="space-y-5">
              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                  手机号
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入11位手机号"
                  maxLength={11}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                  密码
                </label>
                <input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="请输入6位数字密码"
                  maxLength={6}
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base text-center text-lg tracking-[0.5em]"
                />
                <p className="text-xs text-[var(--color-muted)] mt-1.5">
                  首次登录请使用短信验证码，登录后可设置密码
                </p>
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
                disabled={loading || !/^\d{6}$/.test(pwd)}
                className="btn-primary w-full text-base py-3.5 disabled:opacity-50"
              >
                {loading ? "登录中..." : "登录"}
              </button>

              {/* Forgot password link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={switchToCodeTab}
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  忘记密码？使用验证码登录
                </button>
              </div>
            </form>
          )}

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

      {/* ── 设置密码弹窗 ── */}
      {showSetPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-4xl block mb-3">🔐</span>
              <h2 className="text-xl font-bold text-[var(--color-ink)]">设置登录密码</h2>
              <p className="text-sm text-[var(--color-muted)] mt-2">
                设置6位数字密码，下次可直接用密码登录，无需等待验证码
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                  设置6位数字密码
                </label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="请输入6位数字密码"
                  maxLength={6}
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base text-center text-lg tracking-[0.5em]"
                  autoFocus
                />
              </div>

              {setPwdError && (
                <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
                  {setPwdError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSkipSetPassword}
                  className="flex-1 py-3 rounded-xl border border-[var(--color-hairline)] text-[var(--color-muted)] font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  跳过
                </button>
                <button
                  onClick={handleSetPassword}
                  disabled={setPwdLoading || !/^\d{6}$/.test(newPwd)}
                  className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {setPwdLoading ? "设置中..." : "确认设置"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
