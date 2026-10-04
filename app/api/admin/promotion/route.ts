import { NextResponse } from "next/server";
import { getPromotion, savePromotion } from "@/lib/promotionStore";
import { checkPromotion, parsePromotion } from "@/lib/promotion";

// Admin-only: /api/admin/* is behind the session check in proxy.ts.

export async function GET() {
  try {
    const promotion = await getPromotion();
    return NextResponse.json({ promotion, check: checkPromotion(promotion) });
  } catch (error) {
    console.error("GET admin promotion error:", error);
    return NextResponse.json({ error: "Failed to load the offer" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const promotion = parsePromotion(await request.json());
    const check = checkPromotion(promotion);
    if (check.errors.length) {
      return NextResponse.json({ error: check.errors.join(" "), check }, { status: 400 });
    }
    const saved = await savePromotion(promotion);
    return NextResponse.json({ promotion: saved, check });
  } catch (error) {
    console.error("PUT admin promotion error:", error);
    return NextResponse.json({ error: "Failed to save the offer" }, { status: 500 });
  }
}
