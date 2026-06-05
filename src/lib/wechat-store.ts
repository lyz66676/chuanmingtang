/**
 * 微信小店开放平台 API 工具库
 *
 * 文档：微信小店代客下单说明文档
 *
 * API 地址：
 *   主: https://open-apisix.iwosai.com
 *   备: https://open-api.shouqianba.com
 *
 * 认证：Authorization: appid MD5(body + appkey)
 * 回调验签：SHA256WithRSA
 *
 * 流程：
 *   1. savePreOrder → 创建预订单，获取 preOrderId
 *   2. generatePreOrderH5Link → 生成 H5 支付链接
 *   3. 用户跳转到 H5 链接完成支付
 *   4. 回调通知支付结果（SHA256WithRSA 验签）
 */

import crypto from "node:crypto";

/* ── 常量 ── */

const API_BASE = "https://open-apisix.iwosai.com";
const API_BASE_FALLBACK = "https://open-api.shouqianba.com";

const PRE_ORDER_PATH = "/optimus/module/open/preOrder/savePreOrder";
const H5_LINK_PATH = "/optimus/module/open/preOrder/generatePreOrderH5Link";

/** 微信小店回调解密 RSA 公钥（PKCS#8 / X.509） */
const WECHAT_STORE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3Hlg887xrRWYxPqLDX53
oimjsxfd7PDdhQ4zHUYA1eQP6PMyhAo+GU/oq4RQVpW6LrG0PWA6CoD7qva6T0Nw
sDWn5/fmWhmH+Ad6K5WG5jY9ZVjnys9R+HGeFyE7hSkhqSgiSlEMv9IBJD5p9ZqB
Z0FAPotMS/RIBHANVA37J0Zlp9wakvUegcXb3hl9xp+aRsjikhS5h89qiPPXGkWq
9dsQrbpDODP8RziqskxzIzu4tYtvLkUZ/Ak9LCRu63SSGX+yAj24mG9Q+4taWGX3
2AmuVFK9CGDoec0IYx8ouUtiGWVBqZz0dRteKbBbL6MtnPjUxT+wMc6rarPL8zj9
vwIDAQAB
-----END PUBLIC KEY-----`;

/* ── 类型 ── */

export interface WechatStoreConfig {
  appId: string;
  appKey: string;
  merchantId: string;
  merchantUserId: string;
  mallSn: string;
  mallSignature: string;
}

export interface PreOrderParams {
  config: WechatStoreConfig;
  /** 订单金额（元） */
  amount: number;
  /** 订单商品描述 */
  items: { title: string; quantity: number; price: number }[];
  /** 商户请求号（用订单号） */
  requestId: string;
}

export interface PreOrderResult {
  preOrderId: string;
}

export interface H5LinkResult {
  /** H5 支付链接 */
  url: string;
  [key: string]: unknown;
}

export interface CallbackNotification {
  eventId: string | number;
  timestamp: number;
  nonce: string;
  content: string;
  signature: string;
}

export interface CallbackContent {
  /** 微信小店订单号 */
  orderSn: string;
  /** 支付金额（分） */
  orderAmount: number;
  /** 订单状态码: 35=支付成功 */
  orderStateCode: number;
  /** 商品列表 */
  items: { title: string; quantity: string }[];
  /** 商户请求号（如果有） */
  requestId?: string;
  [key: string]: unknown;
}

/* ── 认证工具 ── */

/**
 * 生成微信小店 API 签名
 *
 * sign = MD5(body + appKey)
 * Authorization: appId + " " + sign
 */
function generateAuthHeader(bodyStr: string, config: WechatStoreConfig): string {
  const sign = crypto
    .createHash("md5")
    .update(bodyStr + config.appKey)
    .digest("hex")
    .toUpperCase();
  return `${config.appId} ${sign}`;
}

/**
 * HTTP POST 请求（主地址 + 备用地址自动切换）
 */
async function apiPost(
  path: string,
  body: Record<string, unknown>,
  config: WechatStoreConfig,
  label: string
): Promise<Record<string, unknown>> {
  const bodyStr = JSON.stringify(body);
  const authHeader = generateAuthHeader(bodyStr, config);

  const urls = [`${API_BASE}${path}`, `${API_BASE_FALLBACK}${path}`];

  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      console.log(`[微信小店] ${label} 请求:`, url);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: bodyStr,
      });

      const text = await res.text();
      let result: Record<string, unknown>;
      try {
        result = JSON.parse(text);
      } catch {
        console.log(`[微信小店] ${label} 响应非 JSON:`, text.slice(0, 200));
        continue;
      }

      console.log(`[微信小店] ${label} 响应:`, JSON.stringify(result).slice(0, 500));

      // 检查是否有错误码
      if (result.error_code || result.errorMessage) {
        lastError = new Error(
          `${label}失败: ${result.error_message || result.errorMessage || JSON.stringify(result)}`
        );
        continue;
      }

      return result;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.log(`[微信小店] ${label} 请求异常:`, lastError.message);
    }
  }

  throw lastError || new Error(`${label}失败: 所有地址均不可用`);
}

/* ── 1. 创建预订单 ── */

/**
 * 创建微信小店预订单
 *
 * 返回 preOrderId，用于后续生成 H5 支付链接。
 * preOrderId 需要保存到订单记录中。
 */
export async function createPreOrder(
  params: PreOrderParams
): Promise<PreOrderResult> {
  const { config, amount, items, requestId } = params;

  const checkoutItems = items.map((item) => ({
    title: item.title,
    skuDesc: "",
    quantity: String(item.quantity),
    unit: "",
  }));

  const body = {
    appid: config.appId,
    seller: {
      merchantId: config.merchantId,
      merchantUserId: config.merchantUserId,
      role: "super_admin",
    },
    mallID: {
      mallSn: config.mallSn,
      signature: config.mallSignature,
    },
    source: 3,
    amount: {
      oriAmount: amount,
    },
    checkout: {
      type: 2,
      items: checkoutItems,
    },
    scenes: "[]",
    requestId,
  };

  const result = await apiPost(PRE_ORDER_PATH, body, config, "创建预订单");

  const data = result.data as Record<string, unknown> | undefined;
  const preOrderId = (data?.preOrderId as string) || (result.preOrderId as string);

  if (!preOrderId) {
    throw new Error("创建预订单失败: 未获取到 preOrderId");
  }

  console.log(`[微信小店] 预订单创建成功: preOrderId=${preOrderId}`);

  return { preOrderId };
}

/* ── 2. 生成 H5 支付链接 ── */

/**
 * 生成微信小店 H5 支付链接
 *
 * 返回用户在浏览器中打开的支付页面 URL。
 * 顾客在该页面完成微信支付后，会自动跳转回 returnUrl。
 */
export async function generateH5Link(
  preOrderId: string,
  config: WechatStoreConfig
): Promise<H5LinkResult> {
  const body = {
    appid: config.appId,
    seller: {
      merchantId: config.merchantId,
      merchantUserId: config.merchantUserId,
      role: "super_admin",
    },
    preOrderId,
    pageType: "5",
  };

  const result = await apiPost(H5_LINK_PATH, body, config, "生成 H5 链接");

  // 响应可能是 { data: { url: "..." } } 或 { data: "url..." }
  const data = result.data as Record<string, unknown> | undefined;
  let url: string | undefined;

  if (typeof data === "string") {
    url = data;
  } else if (data && typeof data.url === "string") {
    url = data.url;
  } else if (typeof result.url === "string") {
    url = result.url as string;
  }

  if (!url) {
    throw new Error("生成 H5 链接失败: 未获取到支付 URL");
  }

  console.log(`[微信小店] H5 链接生成成功`);

  return { url, ...(data || {}) };
}

/* ── 3. 检查预订单状态 ── */

/**
 * 查询预订单状态
 *
 * 用于主动轮询订单支付结果。
 * 需要 preOrderId（创建预订单时返回的 ID）。
 */
export async function queryPreOrder(
  preOrderId: string,
  config: WechatStoreConfig
): Promise<Record<string, unknown>> {
  const body = {
    appid: config.appId,
    seller: {
      merchantId: config.merchantId,
      merchantUserId: config.merchantUserId,
      role: "super_admin",
    },
    preOrderId,
  };

  const result = await apiPost(
    "/optimus/module/open/preOrder/queryPreOrder",
    body,
    config,
    "查询预订单"
  );

  // 响应中的 data 包含订单详情（含支付状态）
  const data = result.data as Record<string, unknown> | undefined;
  return data || result;
}

/* ── 4. 回调验签 ── */

/**
 * 验证微信小店回调签名
 *
 * 微信小店在订单状态变更时 POST 通知到 notify_url。
 * 通知格式：
 * {
 *   "eventId": 123,
 *   "timestamp": 1706679507593,
 *   "nonce": "random_string",
 *   "content": "{...}",
 *   "signature": "base64_rsa_signature"
 * }
 *
 * 签名算法：SHA256WithRSA
 * plaintext = eventId + timestamp + nonce + content
 * 使用预置的微信小店 RSA 公钥验签
 */
export function verifyCallback(
  notification: CallbackNotification
): CallbackContent | null {
  try {
    const { eventId, timestamp, nonce, content, signature } = notification;

    if (!eventId || !timestamp || !nonce || !content || !signature) {
      console.warn("[微信小店] 回调参数不完整");
      return null;
    }

    // 1. 构造待验签原文
    const plaintext = `${eventId}${timestamp}${nonce}${content}`;

    // 2. Base64 解码签名
    const signatureBytes = Buffer.from(signature, "base64");

    // 3. 加载 RSA 公钥
    const publicKey = crypto.createPublicKey(WECHAT_STORE_PUBLIC_KEY);

    // 4. SHA256WithRSA 验签
    const isValid = crypto.verify(
      "sha256",
      Buffer.from(plaintext, "utf-8"),
      publicKey,
      signatureBytes
    );

    if (!isValid) {
      console.warn("[微信小店] 回调签名验证失败");
      return null;
    }

    console.log("[微信小店] 回调签名验证通过");

    // 5. 解析 content JSON
    const contentData: CallbackContent = JSON.parse(content);
    return contentData;
  } catch (err) {
    console.error("[微信小店] 回调验签异常:", err);
    return null;
  }
}
