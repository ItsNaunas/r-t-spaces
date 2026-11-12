import { NextResponse } from "next/server";
import { ActionError } from "@/lib/admin/bookingActions";
import { alert } from "@/lib/alerts";

/** Turn an admin action's outcome into JSON the portal can show. */
export async function respond(work: () => Promise<unknown>) {
  try {
    const result = await work();
    return NextResponse.json(typeof result === "string" ? { message: result } : result);
  } catch (error) {
    if (error instanceof ActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    // Stripe explains refusals in plain words (e.g. "already been refunded").
    const stripeMessage =
      typeof error === "object" && error && "type" in error && String((error as { type: string }).type).startsWith("Stripe")
        ? (error as { message?: string }).message
        : null;
    await alert("admin-action", stripeMessage ? `An admin action was refused by Stripe: ${stripeMessage}` : "An admin action failed", error);
    return NextResponse.json({ error: stripeMessage || "Something went wrong. Try again." }, { status: 500 });
  }
}
