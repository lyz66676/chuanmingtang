import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db";
import crypto from "crypto";

/**
 * 收钱吧支付结果回调
 *
 * 收钱吧在顾客支付成功后，会向此地址发送 POST 请求通知支付结果。
 * 需要后续在收钱吧商户后台配置回调地址为：
 *   https://您的域名/api/pay/callback
 *
 * 收钱吧回调参数格式（根据收钱吧官方文档）：
 * {
 *   "order_id": "商户订单号",
 *   "trade_no": "收钱吧交易号",
 *   "total_fee": "支付金额（分）",
 *   "status": "SUCCESS",
 *   "sign": "签名"
 * }
 *
 * 签名算法：
 *   1. 将参数按 key 排序（排除 sign 字段）
 *   2. 拼接成 key1=value1&key2=value2 格式
 *   3. 末尾拼接 &key={API_KEY}
 *   4. 计算 MD5 大写
 */

// 收钱吧 API 密钥（从环境变量读取，开发模式使用默认值）
const SHOUQIANBA_API_KEY = process.env.SHOUQIANBA_API_KEY || "dev_shouqianba_api_key_123456";

/**
 * 验证收钱吧回调签名
 */
function verifySign(params: Record<string, unknown>, apiKey: string): boolean {
  try {
    // 1. 提取签名
    const sign = params.sign as string;
    if (!sign) return false;

    // 2. 排除 sign 字段，按 key 排序
    const sortedKeys = Object.keys(params)
      .filter((key) => key !== "sign")
      .sort();

    // 3. 拼接 key=value 字符串
    const signStr = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    // 4. 末尾拼接 &key={API_KEY}
    const rawStr = `${signStr}&key=${apiKey}`;

    // 5. 计算 MD5 大写
    const expectedSign = crypto.createHash("md5").update(rawStr).digest("hex").toUpperCase();

    return expectedSign === sign;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("收钱吧回调收到:", JSON.stringify(body));

    // 验证签名
    const isValid = verifySign(body, SHOUQIANBA_API_KEY);
    if (!isValid) {
      console.warn("签名验证失败，回调数据:", JSON.stringify(body));
      // 开发模式下不阻止支付成功处理
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { result_code: "FAIL", error: "签名验证失败" },
          { status: 401 }
        );
      }
      console.log("开发模式：跳过签名验证");
    }

    const { order_id, status } = body;

    if (!order_id) {
      return NextResponse.json(
        { result_code: "FAIL", error: "缺少订单号" },
        { status: 400 }
      );
    }

    const order = getOrderById(order_id);
    if (!order) {
      return NextResponse.json(
        { result_code: "FAIL", error: "订单不存在" },
        { status: 404 }
      );
    }

    if (order.pay_status === "paid") {
      console.log(`订单 ${order_id} 已支付，忽略重复回调`);
      return NextResponse.json({ result_code: "SUCCESS" });
    }

    if (status === "SUCCESS") {
      updateOrderStatus(order_id, "paid", {
        pay_status: "paid",
        pay_time: new Date().toISOString(),
      });
      console.log(`订单 ${order_id} 支付成功`);

      // TODO: 可选 - 发送邮件/短信通知管理员
    }

    // 收钱吧要求返回特定格式的成功响应
    return NextResponse.json({ result_code: "SUCCESS" });
  } catch (error) {
    console.error("支付回调处理失败:", error);
    return NextResponse.json(
      { result_code: "FAIL", error: "处理失败" },
      { status: 500 }
    );
  }
}
