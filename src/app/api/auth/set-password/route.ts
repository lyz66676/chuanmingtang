import { NextRequest, NextResponse } from "next/server";
import { setPassword, verifySmsCode } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { phone, code, password } = await request.json();

    // 校验手机号
    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
    }

    // 校验验证码
    if (!code) {
      return NextResponse.json({ error: "请输入短信验证码" }, { status: 400 });
    }

    // 校验密码：6位数字
    if (!password || !/^\d{6}$/.test(password)) {
      return NextResponse.json({ error: "密码必须是6位数字" }, { status: 400 });
    }

    // 验证短信验证码（必须先验证身份才能设置密码）
    const isValid = verifySmsCode(phone, code);
    if (!isValid) {
      return NextResponse.json({ error: "验证码错误或已过期" }, { status: 401 });
    }

    // 设置密码
    const success = setPassword(phone, password);
    if (!success) {
      return NextResponse.json({ error: "该手机号尚未注册，请先登录" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "密码设置成功",
    });
  } catch {
    return NextResponse.json({ error: "设置密码失败，请稍后重试" }, { status: 500 });
  }
}
