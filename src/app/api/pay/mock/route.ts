import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db";

/**
 * 模拟支付成功页面
 *
 * 开发模式下，用户扫码或点击支付链接后会访问此页面。
 * 此页面模拟支付成功，然后跳转到订单详情页。
 *
 * 生产环境：此文件不需要部署，收钱吧会处理真实支付。
 */

export async function GET(request: NextRequest) {
  const order_id = request.nextUrl.searchParams.get("order_id");

  if (!order_id) {
    return new NextResponse("缺少订单号", { status: 400 });
  }

  const order = getOrderById(order_id);
  if (!order) {
    return new NextResponse("订单不存在", { status: 404 });
  }

  if (order.pay_status === "paid") {
    // 已支付，直接跳转
    return redirectToOrder(order_id);
  }

  // 模拟支付成功：更新订单状态
  updateOrderStatus(order_id, "paid", {
    pay_status: "paid",
    pay_time: new Date().toISOString(),
  });

  console.log(`[模拟支付] 订单 ${order_id} 支付成功`);

  // 跳转到订单详情页
  return redirectToOrder(order_id);
}

function redirectToOrder(orderId: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/order/${orderId}">
  <title>支付成功</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .card { text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #16a34a; margin: 0 0 8px; }
    p { color: #6b7280; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>支付成功</h1>
    <p>正在跳转到订单详情页...</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "content-type": "text/html;charset=utf-8" },
  });
}
