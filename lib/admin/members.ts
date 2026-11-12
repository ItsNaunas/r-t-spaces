import Stripe from "stripe";
import { MEMBERSHIP_TIERS } from "@/lib/membership";
import { logActivity } from "@/lib/activity";

/**
 * Memberships live in Stripe as subscriptions (metadata.tierId). This reads
 * them for /admin/members and lets the studio cancel one, honouring the
 * three-month minimum term the membership page promises.
 */
export const MINIMUM_MONTHS = 3;

export type Member = {
  id: string;
  name: string;
  email: string;
  tier: string;
  monthly: number;
  status: Stripe.Subscription.Status;
  startedAt: string;
  /** When it stops, if a cancellation is scheduled. */
  endsAt: string | null;
  nextPaymentAt: string | null;
  /** The latest invoice failed (card declined etc.). */
  paymentFailing: boolean;
  stripeUrl: string;
};

function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) throw new Error("Stripe is not configured");
  return new Stripe(key, { apiVersion: "2025-11-17.clover" });
}

const iso = (seconds: number | null | undefined) => (seconds ? new Date(seconds * 1000).toISOString() : null);

/** The earliest a membership may end: three months after it started. */
export function minimumEnd(startSeconds: number): Date {
  const d = new Date(startSeconds * 1000);
  d.setUTCMonth(d.getUTCMonth() + MINIMUM_MONTHS);
  return d;
}

export async function listMembers(): Promise<Member[]> {
  const subs = await stripe()
    .subscriptions.list({ status: "all", limit: 100, expand: ["data.customer", "data.latest_invoice"] })
    .autoPagingToArray({ limit: 1000 });
  return subs
    .filter((s) => s.metadata?.tierId)
    .map((s) => {
      const customer = typeof s.customer === "object" && !("deleted" in s.customer && s.customer.deleted) ? (s.customer as Stripe.Customer) : null;
      const tier = MEMBERSHIP_TIERS[s.metadata.tierId];
      const invoice = typeof s.latest_invoice === "object" ? s.latest_invoice : null;
      const periodEnd = s.items.data[0]?.current_period_end;
      return {
        id: s.id,
        name: customer?.name ?? "",
        email: customer?.email ?? "",
        tier: tier?.name ?? s.metadata.tierId,
        monthly: tier?.amount ?? (s.items.data[0]?.price.unit_amount ?? 0) / 100,
        status: s.status,
        startedAt: iso(s.start_date)!,
        endsAt: iso(s.cancel_at) ?? (s.cancel_at_period_end ? iso(periodEnd) : null) ?? iso(s.ended_at),
        nextPaymentAt: s.status === "active" && !s.cancel_at && !s.cancel_at_period_end ? iso(periodEnd) : null,
        paymentFailing:
          s.status === "past_due" || s.status === "unpaid" || (invoice?.status === "open" && (invoice.attempt_count ?? 0) > 0),
        stripeUrl: `https://dashboard.stripe.com/subscriptions/${s.id}`,
      };
    })
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/**
 * Stop a membership: at the end of the current period, or at the end of the
 * three-month minimum if that is later. Nothing already paid is refunded.
 */
export async function cancelMember(id: string, now: Date = new Date()): Promise<string> {
  if (!/^sub_[A-Za-z0-9]+$/.test(id)) throw new Error("Membership not found");
  const s = stripe();
  const sub = await s.subscriptions.retrieve(id);
  if (!sub.metadata?.tierId) throw new Error("Membership not found");
  if (sub.status === "canceled") return "That membership has already ended.";

  const periodEnd = sub.items.data[0]?.current_period_end ?? Math.floor(now.getTime() / 1000);
  const minEnd = Math.floor(minimumEnd(sub.start_date).getTime() / 1000);
  const endAt = Math.max(periodEnd, minEnd);
  await s.subscriptions.update(id, { cancel_at: endAt });

  const when = new Date(endAt * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  await logActivity({ action: "member.cancel", summary: `Cancelled membership ${id}: ends ${when}`, ref: id });
  return endAt === minEnd && minEnd > periodEnd
    ? `Cancelled. It ends on ${when}, when the 3-month minimum is up; payments continue until then.`
    : `Cancelled. It ends on ${when}, the end of the period they've paid for.`;
}
