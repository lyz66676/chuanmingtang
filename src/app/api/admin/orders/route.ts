import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, updateOrderStatus, getOrderStats } from "@/lib/db";

// 简单的 token 验证
function verifyToken(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  // 简单验证：token 以 "admin:" 开头（base64 解码后）
  try {
    const decoded = Buffer.from(token, "base64").toString();
    return decoded.startsWith("admin:");
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const orders = getAllOrders(status);
    const stats = getOrderStats();

    return NextResponse.json({ success: true, orders, stats });
  } catch (error) {
    console.error("查询订单列表失败:", error);
    return NextResponse.json(
      { error: "查询订单列表失败" },
      { status: 500 }
    );
  }
}
