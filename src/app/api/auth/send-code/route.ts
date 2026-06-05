import { NextRequest, NextResponse } from "next/server";
import { sendSmsVerifyCode } from "@/lib/aliyun";
import { saveSmsCode } from "@/lib/db";

/** 将阿里云 API 的错误码转为用户友好的提示 */
function getFriendlyErrorMessage(msg: string | undefined): string {
  if (!msg) return "短信通道暂不可用";
  const known = [
    { key: "SignName is mandatory", hint: "请检查阿里云号码认证服务→赠送签名配置中的签名名称是否与 ALIYUN_SMS_SIGN_NAME 一致" },
    { key: "no sign", hint: "短信签名未配置，请检查阿里云号码认证服务控制台" },
    { key: "TemplateCode", hint: "短信模板未配置，请检查阿里云号码认证服务控制台" },
    { key: "InvalidAccessKeyId", hint: "阿里云 AccessKey ID 无效" },
    { key: "SignatureDoesNotMatch", hint: "阿里云密钥不匹配" },
    { key: "isv.OUT_OF_SERVICE", hint: "阿里云号码认证服务未开通" },
    { key: "isv.PRODUCT_UN_SUBSCRIPT", hint: "未开通阿里云号码认证服务" },
    { key: "isv.SMS_SIGNATURE_ILLEGAL", hint: "短信签名不合法或未审批" },
  ];
  for (const { key, hint } of known) {
    if (msg.includes(key)) return hint;
  }
  return `短信通道暂不可用（${msg.slice(0, 40)}）`;
}

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

    // 生成 6 位随机验证码
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // 如果没有配置阿里云凭证，回退到开发模式
    if (!accessKeyId || !accessKeySecret) {
      console.warn("[SMS] 未配置阿里云凭证，使用开发模式验证码", code);
      saveSmsCode(phone, code);
      return NextResponse.json({
        success: true,
        message: "验证码已发送（开发模式）",
        dev_code: code,
      });
    }

    // 检查是否配置了签名和模板
    if (!signName || !templateCode) {
      console.warn("[SMS] 未配置 ALIYUN_SMS_SIGN_NAME 或 ALIYUN_SMS_TEMPLATE_CODE，使用开发模式验证码", code);
      saveSmsCode(phone, code);
      return NextResponse.json({
        success: true,
        message: "验证码已发送（开发模式）",
        dev_code: code,
      });
    }

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
      // 阿里云 API 调用失败，降级到开发模式：仍然将验证码存入数据库并返回给前端
      console.error("[SMS] 阿里云发送失败:", result.message);
      // 常见错误提示优化
      const friendlyMsg = getFriendlyErrorMessage(result.message);
      saveSmsCode(phone, code);
      return NextResponse.json({
        success: true,
        message: `验证码已生成（${friendlyMsg}）`,
        dev_code: code,
        warning: friendlyMsg,
      });
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
