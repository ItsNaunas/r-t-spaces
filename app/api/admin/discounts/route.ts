import { NextResponse } from "next/server";
import { getAllDiscountCodes, saveDiscountCode, getDiscountCode } from "@/lib/admin/kv";
import type { DiscountCode } from "@/lib/admin/types";

export async function GET() {
  try {
    const codes = await getAllDiscountCodes();
    return NextResponse.json(codes);
  } catch (error) {
    console.error("GET discounts error:", error);
    return NextResponse.json({ error: "Failed to fetch discount codes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, type, value, scope, expiresAt, maxUses, active } = body ?? {};

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    const normalised = code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{2,20}$/.test(normalised)) {
      return NextResponse.json({ error: "Code must be 2–20 characters (letters, numbers, _ or -)" }, { status: 400 });
    }
    if (!["percentage", "fixed"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'percentage' or 'fixed'" }, { status: 400 });
    }
    if (typeof value !== "number" || value <= 0) {
      return NextResponse.json({ error: "Value must be a positive number" }, { status: 400 });
    }
    if (type === "percentage" && value > 100) {
      return NextResponse.json({ error: "Percentage value must be 100 or less" }, { status: 400 });
    }

    const existing = await getDiscountCode(normalised);
    if (existing) {
      return NextResponse.json({ error: "A code with that name already exists" }, { status: 409 });
    }

    const newCode: DiscountCode = {
      code: normalised,
      type,
      value,
      scope: scope ?? "global",
      expiresAt: expiresAt ?? null,
      maxUses: maxUses ?? null,
      usedCount: 0,
      active: active !== false,
      createdAt: new Date().toISOString(),
    };

    await saveDiscountCode(newCode);
    return NextResponse.json(newCode, { status: 201 });
  } catch (error) {
    console.error("POST discounts error:", error);
    return NextResponse.json({ error: "Failed to create discount code" }, { status: 500 });
  }
}
