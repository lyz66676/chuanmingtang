import { NextRequest, NextResponse } from "next/server";
import { sendSmsVerifyCode } from "@/lib/aliyun";
import { saveSmsCode } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
    }

    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
    const signName = process.env.ALIYUN_SMS_SIGN_NAME;
    const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE;

    // 如果没有配置阿里云凭证，回退到开发模式
    if (!accessKeyId || !accessKeySecret) {
      console.warn("[SMS] 未配置阿里云凭证，使用开发模式验证码 123456");
      saveSmsCode(phone, "123456");
      return NextResponse.json({
        success: true,
        message: "验证码已发送",
        dev_mode: true,
      });
    }

    // 检查是否配置了签名和模板
    if (!signName || !templateCode) {
      console.warn("[SMS] 未配置 ALIYUN_SMS_SIGN_NAME 或 ALIYUN_SMS_TEMPLATE_CODE，使用开发模式验证码 123456");
      saveSmsCode(phone, "123456");
      return NextResponse.json({
        success: true,
        message: "验证码已发送",
        dev_mode: true,
      });
    }

    // 生成 6 位随机验证码
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // 调用阿里云号码认证服务 SendSmsVerifyCode API
    // 需要配置以下环境变量:
    //   ALIYUN_SMS_SIGN_NAME     - 号码认证服务控制台 -> 赠送签名配置 中的签名名称
    //   ALIYUN_SMS_TEMPLATE_CODE - 号码认证服务控制台 -> 赠送模板配置 中的模板 CODE
    const result = await sendSmsVerifyCode(
      phone,
      accessKeyId,
      accessKeySecret,
      signName,
      templateCode,
      code
    );

    if (!result.success) {
      console.error("[SMS] 发送失败:", result.message);
      return NextResponse.json(
        { error: result.message || "验证码发送失败，请稍后重试" },
        { status: 500 }
      );
    }

    // 将验证码存入数据库（5分钟有效期）
    saveSmsCode(phone, code);

    return NextResponse.json({
      success: true,
      message: "验证码已发送",
    });
  } catch {
    return NextResponse.json({ error: "请求参数错误" }, { status: 400 });
  }
}
