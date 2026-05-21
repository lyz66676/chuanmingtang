import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getAddressById, updateAddress, deleteAddress } from "@/lib/db";

/** PUT /api/addresses/[id] — 编辑地址 */
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

  try {
    const body = await request.json();
    const updated = updateAddress(id, {
      name: body.name,
      phone: body.phone,
      province: body.province,
      city: body.city,
      district: body.district,
      detail: body.detail,
      is_default: body.is_default,
    });

    return NextResponse.json({ success: true, address: updated });
  } catch {
    return NextResponse.json({ error: "更新地址失败" }, { status: 500 });
  }
}

/** DELETE /api/addresses/[id] — 删除地址 */
export async function DELETE(
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

  deleteAddress(id);
  return NextResponse.json({ success: true });
}
