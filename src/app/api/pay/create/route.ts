import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db";
import crypto from "crypto";

/**
 * 支付创建接口
 *
 * 收钱吧 H5 支付（JSAPI）流程：
 * 1. 前端 POST 此接口，传入 order_id
 * 2. 后端调用收钱吧 API 创建支付订单，获取支付页面 URL
 * 3. 前端直接跳转到支付页面
 * 4. 用户完成支付后，收钱吧回调 /api/pay/callback 通知支付结果
 * 5. 用户被重定向回订单详情页
 *
 * 收钱吧 API 文档参考：
 *   https://doc.shouqianba.com/zh-cn/api/interface/activate.html
 */

const VENDOR_SN = process.env.SHOUQIANBA_VENDOR_SN || "";
const API_KEY = process.env.SHOUQIANBA_API_KEY || "";
// 收钱吧 API 网关地址（生产环境）
const SHOUQIANBA_API_URL = "https://api.shouqianba.com/gateway";

/**
 * 生成收钱吧 API 签名
 * 签名算法：MD5(参数按 key 排序拼接 + &key=API_KEY)
 */
function generateSign(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  const rawStr = `${signStr}&key=${API_KEY}`;
  return crypto.createHash("md5").update(rawStr).digest("hex").toUpperCase();
}

/**
 * 调用收钱吧 API 创建支付订单
 */
async function createShouqianbaPayment(order: {
  id: string;
  total: number;
  customer_name: string;
  phone: string;
}): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // 收钱吧 JSAPI 请求参数
  const content = {
    sn: order.id,                          // 商户订单号
    total_amount: Math.round(order.total * 100), // 金额（分）
    subject: `川名堂-${order.customer_name}`,    // 订单标题
    body: `川名堂订单 ${order.id}`,              // 订单描述
    notify_url: `${baseUrl}/api/pay/callback`,   // 异步回调地址
    return_url: `${baseUrl}/order/${order.id}`,  // 同步跳转地址（支付完成后跳回）
    pay_type: "all",                             // 支付方式：all=全部
    terminal_sn: "auto",                         // 终端号
    client_ip: "127.0.0.1",
    operator: order.customer_name || "customer",
    goods_num: 1,
  };

  const contentStr = JSON.stringify(content);

  // 构建请求参数
  const params: Record<string, string> = {
    vendor_sn: VENDOR_SN,
    terminal_sn: "auto",
    app_id: "auto",
    code: "JSAPI",
    content: contentStr,
  };

  // 生成签名
  params.sign = generateSign(params);

  console.log("[收钱吧] 创建支付订单:", params);

  const response = await fetch(SHOUQIANBA_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify(params),
  });

  const result = await response.json();
  console.log("[收钱吧] 响应:", JSON.stringify(result));

  if (result.result_code === "SUCCESS") {
    // JSAPI 返回的 pay_url 是支付页面地址
    const bizResponse = JSON.parse(result.biz_response);
    return bizResponse.pay_url;
  }

  throw new Error(result.error_message || "收钱吧创建支付失败");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
    }

    const order = getOrderById(order_id);
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (order.pay_status === "paid") {
      return NextResponse.json({ error: "订单已支付" }, { status: 400 });
    }

    let payUrl: string;

    // 检查是否有收钱吧配置（有商户号和密钥则调用真实 API）
    if (VENDOR_SN && API_KEY) {
      try {
        payUrl = await createShouqianbaPayment({
          id: order.id,
          total: order.total,
          customer_name: order.customer_name,
          phone: order.phone,
        });
      } catch (err) {
        console.error("[收钱吧] API 调用失败，降级到模拟支付:", err);
        // 如果真实 API 调用失败，降级到模拟支付
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        payUrl = `${baseUrl}/api/pay/mock?order_id=${order_id}`;
      }
    } else {
      // 开发模式：使用模拟支付
      console.log("[支付] 使用模拟支付（未配置收钱吧商户号）");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      payUrl = `${baseUrl}/api/pay/mock?order_id=${order_id}`;
    }

    // 记录支付类型
    updateOrderStatus(order_id, order.status, {
      pay_type: "shouqianba",
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: order.id,
        total: order.total,
        pay_url: payUrl,
        expire_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("创建支付失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建支付失败，请稍后重试" },
      { status: 500 }
    );
  }
}
