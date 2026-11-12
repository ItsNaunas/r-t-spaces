import { NextResponse } from "next/server";
import { setCustomerNotes } from "@/lib/customerNotes";
import { logActivity } from "@/lib/activity";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Save the studio's private notes on a customer: POST { email, notes } */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; notes?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Unknown customer" }, { status: 400 });
  const notes = typeof body.notes === "string" ? body.notes : "";
  await setCustomerNotes(email, notes);
  await logActivity({ action: "customer.notes", summary: `Updated notes on ${email}`, ref: email });
  return NextResponse.json({ message: "Saved." });
}
