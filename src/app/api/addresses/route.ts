import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getAddressesByUser, createAddress } from "@/lib/db";

/** GET /api/addresses — 获取当前用户的地址列表 */
export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const addresses = getAddressesByUser(payload.userId);
  return NextResponse.json({ success: true, addresses });
}

/** POST /api/addresses — 新增地址 */
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.name || !body.phone || !body.detail) {
      return NextResponse.json({ error: "姓名、手机号、详细地址为必填项" }, { status: 400 });
    }

    if (!/^1\d{10}$/.test(body.phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
    }

    const address = createAddress(payload.userId, {
      name: body.name,
      phone: body.phone,
      province: body.province || "",
      city: body.city || "",
      district: body.district || "",
      detail: body.detail,
      is_default: body.is_default || 0,
    });

    return NextResponse.json({ success: true, address });
  } catch {
    return NextResponse.json({ error: "新增地址失败" }, { status: 500 });
  }
}
