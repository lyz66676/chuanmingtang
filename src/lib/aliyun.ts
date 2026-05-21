import crypto from "crypto";

const ALIYUN_ENDPOINT = "https://dypnsapi.aliyuncs.com";

interface AliyunParams {
  [key: string]: string;
}

/**
 * 生成阿里云 API 的通用签名
 * 参考: https://help.aliyun.com/zh/pnvs/developer-reference/api-dypnsapi-2017-05-25-sendsmsverifycode
 */
function percentEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

function computeSignature(
  parameters: AliyunParams,
  accessKeySecret: string
): string {
  // 1. 按字典序排序参数
  const sortedKeys = Object.keys(parameters).sort();
  const canonicalizedQueryString = sortedKeys
    .map((key) => `${percentEncode(key)}=${percentEncode(parameters[key])}`)
    .join("&");

  // 2. 构造待签名字符串
  const stringToSign = `POST&${percentEncode("/")}&${percentEncode(canonicalizedQueryString)}`;

  // 3. 计算 HMAC-SHA1
  const hmac = crypto.createHmac("sha1", `${accessKeySecret}&`);
  hmac.update(stringToSign);
  return hmac.digest("base64");
}

/**
 * 调用阿里云 SendSmsVerifyCode API 发送短信验证码
 * 使用 号码认证服务（PNVS），无需预注册签名和模板
 *
 * @param phoneNumber 手机号
 * @param accessKeyId 阿里云 AccessKey ID
 * @param accessKeySecret 阿里云 AccessKey Secret
 * @param verifyCode 可选的自定义验证码。如果不传，阿里云会自动生成
 */
export async function sendSmsVerifyCode(
  phoneNumber: string,
  accessKeyId: string,
  accessKeySecret: string,
  verifyCode?: string
): Promise<{ success: boolean; bizId?: string; message?: string }> {
  const params: AliyunParams = {
    Action: "SendSmsVerifyCode",
    Format: "JSON",
    Version: "2017-05-25",
    AccessKeyId: accessKeyId,
    SignatureMethod: "HMAC-SHA1",
    SignatureVersion: "1.0",
    SignatureNonce: `${Date.now()}${Math.random().toString(36).substring(2)}`,
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    PhoneNumber: phoneNumber,
    // 验证码长度 6 位数字
    CodeLength: "6",
    // 验证码类型：数字
    CodeType: "1",
    // 短信有效期（分钟）
    SmsUpExtendCode: "5",
  };

  // 如果传入了自定义验证码，则使用它
  if (verifyCode) {
    params.VerifyCode = verifyCode;
  }

  // 计算签名
  params.Signature = computeSignature(params, accessKeySecret);

  // 构建表单数据
  const formBody = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  try {
    const response = await fetch(ALIYUN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const result = await response.json();

    if (result.Code === "OK") {
      return { success: true, bizId: result.BizId };
    } else {
      return {
        success: false,
        message: result.Message || result.Code || "发送失败",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "网络错误",
    };
  }
}
