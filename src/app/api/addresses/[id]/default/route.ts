import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getAddressById, setDefaultAddress } from "@/lib/db";

/** PUT /api/addresses/[id]/default — 设为默认地址 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = getUserFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const address = getAddressById(id);
  if (!address || address.user_id !== payload.userId) {
    return NextResponse.json({ error: "地址不存在" }, { status: 404 });
  }

  const updated = setDefaultAddress(payload.userId, id);
  return NextResponse.json({ success: true, address: updated });
}
