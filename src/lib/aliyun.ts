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
 * 使用 号码认证服务（PNVS），需使用系统赠送的签名和模板
 *
 * 所需环境变量:
 *   ALIYUN_ACCESS_KEY_ID       - 阿里云 AccessKey ID
 *   ALIYUN_ACCESS_KEY_SECRET   - 阿里云 AccessKey Secret
 *   ALIYUN_SMS_SIGN_NAME       - 号码认证服务控制台 -> 赠送签名配置 中的签名名称
 *   ALIYUN_SMS_TEMPLATE_CODE   - 号码认证服务控制台 -> 赠送模板配置 中的模板 CODE
 *
 * 参考文档:
 *   https://help.aliyun.com/zh/pnvs/developer-reference/api-dypnsapi-2017-05-25-sendsmsverifycode
 *
 * 参数说明:
 *   - SignName (必填): 签名名称，使用系统赠送的签名
 *   - TemplateCode (必填): 短信模板 CODE，必须搭配赠送模板
 *   - TemplateParam (必填): 模板参数，使用 ##code## 占位符让阿里云自动生成验证码
 *     - 格式: {"code":"##code##","min":"5"}  (min=有效期分钟数)
 *   - CodeType (条件必填): 当 TemplateParam 使用 ##code## 占位符时必填，1=数字
 *   - CodeLength: 验证码长度（当不传 VerifyCode 时生效）
 *   - VerifyCode (可选): 自定义验证码（传此值则阿里云不自动生成）
 */
export async function sendSmsVerifyCode(
  phoneNumber: string,
  accessKeyId: string,
  accessKeySecret: string,
  signName: string,
  templateCode: string,
  verifyCode?: string
): Promise<{ success: boolean; bizId?: string; message?: string }> {
  // 构建模板参数：使用 ##code## 占位符让阿里云自动生成，有效期 5 分钟
  const templateParam = JSON.stringify({
    code: "##code##",
    min: "5",
  });

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
    // 必填：系统赠送的签名名称
    SignName: signName,
    // 必填：系统赠送的模板 CODE
    TemplateCode: templateCode,
    // 必填：模板参数，##code## 为占位符，阿里云自动生成验证码
    TemplateParam: templateParam,
    // 验证码类型：1=数字（当 TemplateParam 使用 ##code## 时必填）
    CodeType: "1",
    // 验证码长度
    CodeLength: "6",
    // 短信有效期扩展码（分钟）
    SmsUpExtendCode: "5",
  };

  // 如果传入了自定义验证码，则使用它（不传则由阿里云通过 ##code## 自动生成）
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
