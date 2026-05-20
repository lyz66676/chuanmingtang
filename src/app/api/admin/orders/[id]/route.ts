import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db";

function verifyToken(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  try {
    const decoded = Buffer.from(token, "base64").toString();
    return decoded.startsWith("admin:");
  } catch {
    return false;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }
  return NextResponse.json({ success: true, order });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, tracking_no } = body;

    const order = getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 验证状态流转合法性
    const validTransitions: Record<string, string[]> = {
      pending: ["paid", "cancelled"],
      paid: ["shipped", "ready", "cancelled"],
      shipped: ["completed"],
      ready: ["completed"],
    };

    if (status && !validTransitions[order.status]?.includes(status)) {
      return NextResponse.json(
        { error: `订单状态不能从 ${order.status} 变更为 ${status}` },
        { status: 400 }
      );
    }

    const extra: Record<string, unknown> = {};
    if (tracking_no) {
      extra.tracking_no = tracking_no;
    }
    if (status === "paid") {
      extra.pay_status = "paid";
      extra.pay_time = new Date().toISOString();
    }

    const updated = updateOrderStatus(id, status, extra);
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("更新订单失败:", error);
    return NextResponse.json(
      { error: "更新订单失败" },
      { status: 500 }
    );
  }
}
