import { NextResponse } from "next/server";
import { BOOKING_PACKAGES } from "@/lib/pricing";
import { getMergedPackages } from "@/lib/admin/pricing-merged";
import { upsertPackageOverride, deletePackageOverride } from "@/lib/admin/kv";

export async function GET() {
  try {
    const packages = await getMergedPackages();
    return NextResponse.json(packages);
  } catch (error) {
    console.error("GET admin packages error:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, enabled, priceOverride } = body ?? {};

    if (!packageId || !BOOKING_PACKAGES.find((p) => p.id === packageId)) {
      return NextResponse.json({ error: "Invalid packageId" }, { status: 400 });
    }

    if (priceOverride === null) {
      // Clear override — check if we still need to track enabled state
      const existing = BOOKING_PACKAGES.find((p) => p.id === packageId)!;
      if (enabled === undefined || enabled === true) {
        await deletePackageOverride(packageId);
      } else {
        await upsertPackageOverride({ packageId, enabled: false, priceOverride: null, updatedAt: new Date().toISOString() });
      }
    } else {
      await upsertPackageOverride({
        packageId,
        enabled: enabled !== false,
        priceOverride: typeof priceOverride === "number" ? priceOverride : null,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST admin packages error:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}
