import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { BOOKING_PACKAGES, getDepositForPackage } from "@/lib/pricing";
import { checkVoucher, looksLikeVoucher, splitVoucher } from "@/lib/vouchers";
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

    // A gift voucher pays the deposit first, then the balance (checkout
    // re-checks all of this server-side; this is only the preview).
    if (typeof code === "string" && looksLikeVoucher(code)) {
      const check = await checkVoucher(code);
      if (!check.ok) return NextResponse.json({ valid: false, error: check.error });
      const depositPence = Math.round((pkg ? getDepositForPackage(pkg, basePrice) : basePrice / 2) * 100);
      const split = splitVoucher(check.balancePence, depositPence, Math.round(basePrice * 100) - depositPence);
      return NextResponse.json({
        valid: true,
        code: check.code,
        type: "fixed",
        value: check.balancePence / 100,
        discountAmount: split.applied / 100,
        finalPrice: (Math.round(basePrice * 100) - split.applied) / 100,
        finalDeposit: split.chargeNow < 30 ? 0 : split.chargeNow / 100,
        voucher: true,
      });
    }

    const result = await validateDiscountCode(code, packageId ?? "global", basePrice, pkg);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Validate discount error:", error);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
