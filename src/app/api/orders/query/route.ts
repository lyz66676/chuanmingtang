import { NextRequest, NextResponse } from "next/server";
import { getOrdersByPhone } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "请提供手机号参数 phone" },
        { status: 400 }
      );
    }

    const orders = getOrdersByPhone(phone);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("查询订单失败:", error);
    return NextResponse.json(
      { error: "查询订单失败" },
      { status: 500 }
    );
  }
}
