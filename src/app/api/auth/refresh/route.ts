import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";
import { getRefreshToken, deleteRefreshToken, createRefreshToken } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json({ error: "缺少 refresh_token" }, { status: 400 });
    }

    // 查找 refresh_token
    const stored = getRefreshToken(refresh_token);
    if (!stored) {
      return NextResponse.json({ error: "refresh_token 无效" }, { status: 401 });
    }

    // 检查是否过期
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    if (stored.expires_at < now) {
      deleteRefreshToken(refresh_token);
      return NextResponse.json({ error: "refresh_token 已过期，请重新登录" }, { status: 401 });
    }

    // 删除旧的 refresh_token
    deleteRefreshToken(refresh_token);

    // 生成新的 JWT Token
    const token = generateToken({ userId: stored.user_id, phone: "" });

    // 生成新的 refresh_token
    const newRefreshToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    createRefreshToken(stored.user_id, newRefreshToken, expiresAt);

    return NextResponse.json({
      success: true,
      token,
      refresh_token: newRefreshToken,
    });
  } catch {
    return NextResponse.json({ error: "刷新失败，请稍后重试" }, { status: 500 });
  }
}
