import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { BOOKING_PACKAGES } from "@/lib/pricing";
import { validateDiscountCode } from "@/lib/admin/validateDiscount";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    // Without a ceiling this endpoint is a free oracle for guessing discount
    // codes. 20 tries per 10 minutes is far more than a real customer needs.
    const headersList = await headers();
    const { allowed } = await rateLimit("discount", clientIp(headersList), 20, 10 * 60);
    if (!allowed) {
      return NextResponse.json(
        { valid: false, error: "Too many attempts. Please try again shortly." },
        { status: 429 }
      );
    }

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
