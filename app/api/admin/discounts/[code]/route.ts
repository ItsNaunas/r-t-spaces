import { NextResponse } from "next/server";
import { getDiscountCode, saveDiscountCode, deleteDiscountCode } from "@/lib/admin/kv";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const existing = await getDiscountCode(code);
    if (!existing) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    const body = await request.json();
    const { type, value, scope, expiresAt, maxUses, active } = body ?? {};

    const updated = {
      ...existing,
      ...(type !== undefined && { type }),
      ...(value !== undefined && { value }),
      ...(scope !== undefined && { scope }),
      ...(expiresAt !== undefined && { expiresAt }),
      ...(maxUses !== undefined && { maxUses }),
      ...(active !== undefined && { active }),
    };

    await saveDiscountCode(updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT discount error:", error);
    return NextResponse.json({ error: "Failed to update discount code" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const existing = await getDiscountCode(code);
    if (!existing) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    await deleteDiscountCode(code);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE discount error:", error);
    return NextResponse.json({ error: "Failed to delete discount code" }, { status: 500 });
  }
}
