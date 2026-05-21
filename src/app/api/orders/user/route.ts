import { NextRequest, NextResponse } from "next/server";
import { getOrdersByUserId } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json(
        { error: "未登录或登录已过期" },
        { status: 401 }
      );
    }

    const orders = getOrdersByUserId(payload.userId);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("查询用户订单失败:", error);
    return NextResponse.json(
      { error: "查询订单失败" },
      { status: 500 }
    );
  }
}
