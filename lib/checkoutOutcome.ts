import Stripe from "stripe";
import { finalizePaidSession } from "./finalizeBooking";

/**
 * What the customer should be told after Stripe sends them back to us.
 *
 *  - confirmed:   paid, and the booking is confirmed in Cal.com
 *  - unconfirmed: paid, but a hold could not be confirmed (the studio is emailed)
 *  - processing:  not paid yet, being finalised elsewhere, or we couldn't check
 */
export type CheckoutOutcome = "confirmed" | "unconfirmed" | "processing" | "balance_paid";

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

/**
 * Backstop for the Stripe webhook: the session id from the return URL is only
 * an identifier. The session itself is fetched from Stripe, and nothing
 * happens unless Stripe says it is paid. Safe to run alongside the webhook
 * because finalizePaidSession is idempotent per session.
 */
export async function resolveCheckout(sessionId: string | undefined): Promise<CheckoutOutcome> {
  if (!sessionId || !SESSION_ID.test(sessionId)) return "processing";
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) return "processing";

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const result = await finalizePaidSession(session);
    if (result.status !== "done") return "processing";
    if (result.kind === "balance") return "balance_paid";
    return result.calConfirmed ? "confirmed" : "unconfirmed";
  } catch (error) {
    // The webhook remains the primary path; the customer just sees neutral copy.
    console.error("[BOOKING] success-page check failed:", sessionId, error);
    return "processing";
  }
}
