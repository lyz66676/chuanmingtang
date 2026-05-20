import { NextRequest, NextResponse } from "next/server";

// 简单密码认证，后续可改为环境变量
const ADMIN_PASSWORD = "cmt2024";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "请输入密码" },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "密码错误" },
        { status: 401 }
      );
    }

    // 返回一个简单的 token（实际生产环境建议用 JWT）
    const token = Buffer.from(`admin:${Date.now()}`).toString("base64");

    return NextResponse.json({
      success: true,
      token,
      admin: { name: "川名堂管理员" },
    });
  } catch (error) {
    console.error("登录失败:", error);
    return NextResponse.json(
      { error: "登录失败" },
      { status: 500 }
    );
  }
}
