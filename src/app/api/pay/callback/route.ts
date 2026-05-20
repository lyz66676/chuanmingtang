import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db";

/**
 * 收钱吧支付结果回调
 *
 * 收钱吧在顾客支付成功后，会向此地址发送 POST 请求通知支付结果。
 * 需要后续在收钱吧商户后台配置回调地址为：
 *   https://您的域名/api/pay/callback
 *
 * 收钱吧回调参数格式（需根据实际收钱吧文档调整）：
 * {
 *   "order_id": "商户订单号",
 *   "trade_no": "收钱吧交易号",
 *   "total_fee": "支付金额（分）",
 *   "status": "SUCCESS",
 *   "sign": "签名"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("收钱吧回调收到:", JSON.stringify(body));

    // TODO: 验证签名（需配置收钱吧 API 密钥后实现）
    // const isValid = verifyShouqianbaSign(body, API_KEY);
    // if (!isValid) {
    //   return NextResponse.json({ error: "签名验证失败" }, { status: 401 });
    // }

    const { order_id, status } = body;

    if (!order_id) {
      return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
    }

    const order = getOrderById(order_id);
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (status === "SUCCESS") {
      updateOrderStatus(order_id, "paid", {
        pay_status: "paid",
        pay_time: new Date().toISOString(),
      });
      console.log(`订单 ${order_id} 支付成功`);
    }

    // 收钱吧要求返回特定格式的成功响应
    return NextResponse.json({ result_code: "SUCCESS" });
  } catch (error) {
    console.error("支付回调处理失败:", error);
    return NextResponse.json({ result_code: "FAIL", error: "处理失败" });
  }
}
