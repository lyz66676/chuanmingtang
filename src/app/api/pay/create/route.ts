import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db";
import { createPreOrder, generateH5Link } from "@/lib/wechat-store";

/**
 * 支付创建接口
 *
 * 微信小店 H5 支付流程：
 * 1. 前端 POST 此接口，传入 order_id
 * 2. 后端调用微信小店 API 创建预订单（savePreOrder），获取 preOrderId
 * 3. 保存 preOrderId 到订单记录
 * 4. 调用微信小店 API 生成 H5 支付链接（generatePreOrderH5Link）
 * 5. 返回 pay_url，前端跳转到微信小店支付页面
 * 6. 用户使用微信支付完成后，微信小店回调 /api/pay/callback
 *
 * 参考：微信小店代客下单说明文档
 */

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

    const appId = process.env.WECHAT_STORE_APP_ID || "";
    const appKey = process.env.WECHAT_STORE_APP_KEY || "";

    let payUrl: string;

    // 检查是否配置了微信小店
    if (appId && appKey) {
      try {
        const config = {
          appId,
          appKey,
          merchantId: process.env.WECHAT_STORE_MERCHANT_ID || "",
          merchantUserId: process.env.WECHAT_STORE_MERCHANT_USER_ID || "",
          mallSn: process.env.WECHAT_STORE_MALL_SN || "",
          mallSignature: process.env.WECHAT_STORE_MALL_SIGNATURE || "",
        };

        // 1. 创建预订单
        const orderItems = (order.items || []) as {
          name?: string;
          title?: string;
          quantity?: number;
          price?: number;
        }[];
        const items = orderItems.map((item) => ({
          title: item.name || item.title || "商品",
          quantity: item.quantity || 1,
          price: item.price || 0,
        }));

        const preOrder = await createPreOrder({
          config,
          amount: order.total,
          items,
          requestId: order.id,
        });

        // 保存 preOrderId 到订单（用于回调时匹配）
        updateOrderStatus(order_id, order.status, {
          tracking_no: preOrder.preOrderId,
        });

        // 2. 生成 H5 支付链接
        const h5Result = await generateH5Link(preOrder.preOrderId, config);
        payUrl = h5Result.url;

        console.log(`[微信小店] 支付链接已生成: order=${order_id}`);
      } catch (err) {
        console.error("[微信小店] API 调用失败，降级到模拟支付:", err);
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        payUrl = `${baseUrl}/api/pay/mock?order_id=${order_id}`;
      }
    } else {
      // 开发模式：使用模拟支付
      console.log("[支付] 使用模拟支付（未配置微信小店）");
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      payUrl = `${baseUrl}/api/pay/mock?order_id=${order_id}`;
    }

    // 记录支付方式
    updateOrderStatus(order_id, order.status, {
      pay_type: "wechat_store_h5",
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
