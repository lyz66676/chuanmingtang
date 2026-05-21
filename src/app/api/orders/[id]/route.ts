import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("查询订单失败:", error);
    return NextResponse.json(
      { error: "查询订单失败" },
      { status: 500 }
    );
  }
}

// 顾客确认收货
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }
    if (order.status !== "shipped") {
      return NextResponse.json(
        { error: "只有已发货的订单才能确认收货" },
        { status: 400 }
      );
    }
    const updated = updateOrderStatus(id, "completed");
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("确认收货失败:", error);
    return NextResponse.json(
      { error: "确认收货失败" },
      { status: 500 }
    );
  }
}

// 顾客取消订单（仅待付款状态可取消）
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "只有待付款的订单才能取消" },
        { status: 400 }
      );
    }
    const updated = updateOrderStatus(id, "cancelled");
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("取消订单失败:", error);
    return NextResponse.json(
      { error: "取消订单失败" },
      { status: 500 }
    );
  }
}
