import { NextResponse } from "next/server";
import { BOOKING_PACKAGES } from "@/lib/pricing";
import { validateDiscountCode } from "@/lib/admin/validateDiscount";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, packageId, basePrice } = body ?? {};

    if (!code || typeof basePrice !== "number") {
      return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 });
    }

    const pkg = BOOKING_PACKAGES.find((p) => p.id === packageId);
    const result = await validateDiscountCode(code, packageId ?? "global", basePrice, pkg);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Validate discount error:", error);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
