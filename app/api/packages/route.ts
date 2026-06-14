import { NextResponse } from "next/server";
import { getMergedPackages } from "@/lib/admin/pricing-merged";

// Serves live, admin-editable prices from Redis, so it must run per-request.
// (Marking dynamic avoids Next trying to static-render it -> DYNAMIC_SERVER_USAGE.)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const packages = await getMergedPackages();
    return NextResponse.json({ packages: packages.filter((p) => p.enabled) });
  } catch (error) {
    console.error("GET packages error:", error);
    // Fall back to raw packages if KV is unavailable
    const { BOOKING_PACKAGES } = await import("@/lib/pricing");
    return NextResponse.json({ packages: BOOKING_PACKAGES.map((p) => ({ ...p, enabled: true, priceOverrideActive: false })) });
  }
}
