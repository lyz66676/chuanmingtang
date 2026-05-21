"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  phone: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasPassword: boolean;
  login: (phone: string, code: string) => Promise<{ success: boolean; hasPassword?: boolean }>;
  loginWithPassword: (phone: string, password: string) => Promise<boolean>;
  setUserPassword: (phone: string, code: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "cmt_token";
const REFRESH_TOKEN_KEY = "cmt_refresh_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);

  // 初始化：尝试用 refresh_token 自动登录
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        // 尝试刷新 token
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

          // 获取用户信息
          const meRes = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          const meData = await meRes.json();
          if (meData.success) {
            setUser(meData.user);
          }
        } else {
          // refresh 失败，清除 token
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (phone: string, code: string): Promise<{ success: boolean; hasPassword?: boolean }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        setUser(data.user);
        setHasPassword(data.has_password || false);
        return { success: true, hasPassword: data.has_password || false };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  }, []);

  const loginWithPassword = useCallback(async (phone: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        setUser(data.user);
        setHasPassword(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const setUserPassword = useCallback(async (phone: string, code: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, password }),
      });
      const data = await res.json();
      if (data.success) {
        setHasPassword(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
    setHasPassword(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, hasPassword, login, loginWithPassword, setUserPassword, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

/** 获取存储的 token */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
