import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";
import { createUser, getUserByPhone, createRefreshToken, verifySmsCode } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: "请输入验证码" }, { status: 400 });
    }

    // 验证短信验证码（从数据库中校验）
    const isValid = verifySmsCode(phone, code);
    if (!isValid) {
      return NextResponse.json({ error: "验证码错误或已过期" }, { status: 401 });
    }

    // 查找或创建用户
    let user = getUserByPhone(phone);
    if (!user) {
      user = createUser(phone);
    }

    // 生成 JWT Token
    const token = generateToken({ userId: user.id, phone: user.phone });

    // 生成 Refresh Token（30 天有效期）
    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    createRefreshToken(user.id, refreshToken, expiresAt);

    return NextResponse.json({
      success: true,
      token,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
    });
  } catch {
    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
}
