import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, phone, address, delivery_type, items, total, note } = body;

    // 验证必填字段
    if (!customer_name || !phone || !delivery_type || !items || total === undefined) {
      return NextResponse.json(
        { error: "缺少必填字段：姓名、电话、配送方式、商品列表、总价" },
        { status: 400 }
      );
    }

    if (!["delivery", "pickup"].includes(delivery_type)) {
      return NextResponse.json(
        { error: "配送方式无效，只能是 delivery 或 pickup" },
        { status: 400 }
      );
    }

    if (delivery_type === "delivery" && !address) {
      return NextResponse.json(
        { error: "快递配送必须填写地址" },
        { status: 400 }
      );
    }

    const order = createOrder({
      customer_name,
      phone,
      address: address || "",
      delivery_type,
      items: JSON.stringify(items),
      total,
      note: note || "",
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json(
      { error: "创建订单失败，请稍后重试" },
      { status: 500 }
    );
  }
}
