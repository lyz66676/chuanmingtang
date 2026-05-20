import { NextRequest, NextResponse } from "next/server";
import { getOrderStats, getAllOrders } from "@/lib/db";

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
    const stats = getOrderStats();
    const today = new Date().toISOString().slice(0, 10);
    const allOrders = getAllOrders();

    // 今日订单
    const todayOrders = allOrders.filter((o) =>
      o.created_at.startsWith(today)
    );

    // 今日销售额
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        today_orders: todayOrders.length,
        today_revenue: todayRevenue,
        total_orders: allOrders.length,
      },
    });
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json(
      { error: "获取统计数据失败" },
      { status: 500 }
    );
  }
}
