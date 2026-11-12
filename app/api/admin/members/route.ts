import { NextResponse } from "next/server";
import { cancelMember } from "@/lib/admin/members";

/** Cancel a membership: POST { id } (ends at period end or the 3-month minimum, whichever is later). */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { id?: unknown };
    return NextResponse.json({ message: await cancelMember(String(body.id ?? "")) });
  } catch (error) {
    console.error("[ADMIN] member cancel failed:", error);
    const message = error instanceof Error && error.message === "Membership not found" ? error.message : "Couldn't cancel it. Try again, or cancel in Stripe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
