import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, getAllOrders } from "@/lib/db";
import { verifyCallback } from "@/lib/wechat-store";

/**
 * 微信小店支付结果回调
 *
 * 微信小店在订单状态变更时 POST 通知到此地址。
 * 使用 SHA256WithRSA 验签，验证通过后更新订单状态。
 *
 * 回调格式：
 * {
 *   "eventId": 123,
 *   "timestamp": 1706679507593,
 *   "nonce": "random_string",
 *   "content": "{\"orderSn\":\"...\",\"orderStateCode\":35,\"preOrderList\":[...]}",
 *   "signature": "base64_rsa_signature"
 * }
 *
 * orderStateCode: 35 = 支付成功
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[微信小店] 回调收到:", JSON.stringify(body).slice(0, 500));

    // 1. 验证签名并解析内容
    const content = verifyCallback(body);

    if (!content) {
      console.warn("[微信小店] 回调验签失败或内容解析失败");
      return NextResponse.json(
        { error: "签名验证失败" },
        { status: 401 }
      );
    }

    console.log(
      `[微信小店] 回调验证通过: orderSn=${content.orderSn}, stateCode=${content.orderStateCode}`
    );

    // 2. 从回调 content 中查找预订单 ID
    // content 中可能包含 preOrderList，里面有所关联的 preOrderId
    let preOrderId: string | null = null;

    if (content.preOrderList && Array.isArray(content.preOrderList)) {
      const firstPreOrder = content.preOrderList[0];
      if (firstPreOrder) {
        preOrderId =
          (firstPreOrder as Record<string, unknown>).preOrderId as string ||
          (firstPreOrder as Record<string, unknown>).id as string;
      }
    }

    // 3. 通过 preOrderId 匹配我们的订单
    let order = preOrderId
      ? getOrderById(preOrderId) // 尝试直接用 preOrderId 查
      : null;

    if (!order && preOrderId) {
      // 搜索所有订单，根据 tracking_no（保存的 preOrderId）匹配
      const allOrders = getAllOrders();
      order =
        allOrders.find((o) => o.tracking_no === preOrderId) || null;
    }

    if (!order) {
      console.warn(
        `[微信小店] 未找到匹配订单 preOrderId=${preOrderId}`
      );
      // 微信小店要求返回 SUCCESS 确认收到回调
      return NextResponse.json({ result_code: "SUCCESS" });
    }

    // 4. 防止重复处理
    if (order.pay_status === "paid") {
      console.log(`[微信小店] 订单 ${order.id} 已支付，忽略重复回调`);
      return NextResponse.json({ result_code: "SUCCESS" });
    }

    // 5. 判断是否支付成功
    // orderStateCode: 35 = 支付成功（根据文档示例）
    const isPaid = content.orderStateCode === 35;

    if (isPaid) {
      updateOrderStatus(order.id, order.delivery_type === "pickup" ? "paid" : "paid", {
        pay_status: "paid",
        pay_time: new Date().toISOString(),
        // 保存微信小店订单号
        tracking_no: content.orderSn || order.tracking_no,
      });

      console.log(
        `[微信小店] 订单 ${order.id} 支付成功，小店订单号: ${content.orderSn}`
      );
    } else {
      console.log(
        `[微信小店] 订单 ${order.id} 未支付，状态码: ${content.orderStateCode}`
      );
    }

    // 微信小店要求返回 SUCCESS 确认收到回调
    return NextResponse.json({ result_code: "SUCCESS" });
  } catch (error) {
    console.error("[微信小店] 回调处理失败:", error);
    return NextResponse.json(
      { result_code: "FAIL", error: "处理失败" },
      { status: 500 }
    );
  }
}
