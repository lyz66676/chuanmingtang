import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
    }

    // 开发阶段：直接返回固定验证码 123456
    // 上线后：调用阿里云短信 API 发送真实验证码
    return NextResponse.json({
      success: true,
      message: "验证码已发送",
      dev_code: "123456",
    });
  } catch {
    return NextResponse.json({ error: "请求参数错误" }, { status: 400 });
  }
}
