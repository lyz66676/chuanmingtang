import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, getOrderStats } from "@/lib/db";

// 简单的 token 验证
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

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const orders = getAllOrders(status);
    const stats = getOrderStats();

    // 计算今日订单和今日收入
    const today = new Date().toISOString().slice(0, 10);
    const allOrders = getAllOrders();
    const todayOrders = allOrders.filter((o) =>
      o.created_at.startsWith(today)
    );
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      success: true,
      orders,
      stats: {
        ...stats,
        today_orders: todayOrders.length,
        today_revenue: todayRevenue,
        total_orders: allOrders.length,
      },
    });
  } catch (error) {
    console.error("查询订单列表失败:", error);
    return NextResponse.json(
      { error: "查询订单列表失败" },
      { status: 500 }
    );
  }
}
