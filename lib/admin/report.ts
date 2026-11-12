import Stripe from "stripe";
import { getBalanceStatuses, IN_PERSON } from "@/lib/balance";
import { listManualBookings } from "@/lib/manualBookings";
import { listExtrasBetween } from "@/lib/extras";
import { listVouchers, listVoucherUses } from "@/lib/vouchers";

/**
 * Every money movement in one calendar month (UK time), for the accountant:
 * card payments through Stripe, money taken in person, refunds, and voucher
 * redemptions (shown separately: that money arrived when the voucher was sold).
 */
export type ReportRow = {
  at: string;
  type: string;
  method: "card" | "in person" | "voucher";
  customer: string;
  description: string;
  /** Pounds; refunds are negative. */
  amount: number;
  ref: string;
};

export type Report = {
  month: string;
  label: string;
  rows: ReportRow[];
  byType: { type: string; count: number; total: number }[];
  cardIn: number;
  refunds: number;
  inPerson: number;
  vouchersRedeemed: number;
};

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) throw new Error("Stripe is not configured");
  return new Stripe(key, { apiVersion: "2025-11-17.clover" });
}

/** Minutes London is ahead of UTC at that moment (0 or 60). */
function londonOffset(at: Date): number {
  const name = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", timeZoneName: "shortOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = name?.match(/GMT([+-]\d+)(?::(\d+))?/);
  return m ? Number(m[1]) * 60 + Math.sign(Number(m[1])) * Number(m[2] ?? 0) : 0;
}

/** Midnight at the start of the 1st, UK time. */
function londonMonthStart(year: number, month1: number): Date {
  const guess = new Date(Date.UTC(year, month1 - 1, 1));
  return new Date(guess.getTime() - londonOffset(guess) * 60000);
}

export function monthRange(month: string): { from: Date; to: Date; label: string } {
  const m = MONTH.exec(month);
  if (!m) throw new Error("Month must look like 2026-11");
  const year = Number(m[1]);
  const mon = Number(m[2]);
  const from = londonMonthStart(year, mon);
  const to = mon === 12 ? londonMonthStart(year + 1, 1) : londonMonthStart(year, mon + 1);
  const label = new Date(Date.UTC(year, mon - 1, 15)).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return { from, to, label };
}

const TYPE_BY_KIND: Record<string, string> = { balance: "Balance", extra: "Extra charge", voucher: "Gift voucher sold" };

export async function buildReport(month: string): Promise<Report> {
  const { from, to, label } = monthRange(month);
  const inRange = (iso: string | undefined | null) => Boolean(iso) && Date.parse(iso!) >= from.getTime() && Date.parse(iso!) < to.getTime();
  const created = { gte: Math.floor(from.getTime() / 1000), lt: Math.floor(to.getTime() / 1000) };
  const s = stripe();
  const rows: ReportRow[] = [];

  const [sessions, invoices, refunds] = await Promise.all([
    s.checkout.sessions.list({ created, limit: 100 }).autoPagingToArray({ limit: 5000 }),
    s.invoices.list({ created, status: "paid", limit: 100 }).autoPagingToArray({ limit: 5000 }),
    s.refunds.list({ created, limit: 100 }).autoPagingToArray({ limit: 5000 }),
  ]);

  for (const cs of sessions) {
    if (cs.payment_status !== "paid") continue;
    const m = cs.metadata ?? {};
    const type = cs.mode === "subscription" ? "Membership (first month)" : TYPE_BY_KIND[m.kind ?? ""] ?? "Booking deposit";
    rows.push({
      at: new Date(cs.created * 1000).toISOString(),
      type,
      method: "card",
      customer: m.customerName || m.buyerName || cs.customer_details?.name || cs.customer_details?.email || "",
      description: [m.packageTitle, m.bookingDate, m.reason, m.voucherCode ? `voucher ${m.voucherCode} also used` : ""].filter(Boolean).join(", "),
      amount: (cs.amount_total ?? 0) / 100,
      ref: cs.id,
    });
  }

  for (const inv of invoices) {
    if (inv.billing_reason !== "subscription_cycle") continue;
    rows.push({
      at: new Date((inv.status_transitions?.paid_at ?? inv.created) * 1000).toISOString(),
      type: "Membership renewal",
      method: "card",
      customer: inv.customer_name || inv.customer_email || "",
      description: inv.lines.data[0]?.description ?? "",
      amount: inv.amount_paid / 100,
      ref: inv.id ?? "",
    });
  }

  for (const r of refunds) {
    if (r.status !== "succeeded") continue;
    rows.push({
      at: new Date(r.created * 1000).toISOString(),
      type: "Refund",
      method: "card",
      customer: "",
      description: typeof r.payment_intent === "string" ? `payment ${r.payment_intent}` : "",
      amount: -r.amount / 100,
      ref: r.id,
    });
  }

  // Money taken in person: manual bookings, balances and extras marked paid.
  const recentSessions = await s.checkout.sessions
    .list({ created: { gte: created.gte - 200 * 86400 }, limit: 100 })
    .autoPagingToArray({ limit: 5000 });
  const manual = await listManualBookings(new Date(from.getTime() - 400 * 86400_000), new Date(to.getTime() + 400 * 86400_000));
  for (const b of manual) {
    if (b.via === "voucher" || !inRange(b.createdAt) || b.paidUpfront <= 0) continue;
    rows.push({
      at: b.createdAt,
      type: "Booking (taken in person)",
      method: "in person",
      customer: b.name,
      description: `${b.packageTitle}, ${b.bookingDate}${b.cancelledAt ? " (since cancelled)" : ""}`,
      amount: b.paidUpfront,
      ref: b.id,
    });
  }
  const ids = [...recentSessions.filter((x) => x.payment_status === "paid").map((x) => x.id), ...manual.map((b) => b.id)];
  const statuses = await getBalanceStatuses(ids);
  for (const [id, st] of Object.entries(statuses)) {
    if (!st || st.paidSessionId !== IN_PERSON || !inRange(st.paidAt)) continue;
    const session = recentSessions.find((x) => x.id === id);
    const b = manual.find((x) => x.id === id);
    rows.push({
      at: st.paidAt!,
      type: "Balance (taken in person)",
      method: "in person",
      customer: session?.metadata?.customerName ?? b?.name ?? "",
      description: session?.metadata?.bookingDate ?? b?.bookingDate ?? "",
      amount: Number(st.amount) || 0,
      ref: id,
    });
  }
  for (const e of await listExtrasBetween(from, to)) {
    if (e.paidVia !== IN_PERSON || !inRange(e.paidAt)) continue;
    rows.push({ at: e.paidAt!, type: "Extra charge (taken in person)", method: "in person", customer: "", description: e.reason, amount: e.amount, ref: e.bookingId });
  }

  // Vouchers spent this month: not new money, shown for the accountant.
  for (const v of await listVouchers()) {
    for (const use of await listVoucherUses(v.code)) {
      if (!inRange(use.at)) continue;
      rows.push({
        at: use.at,
        type: use.refunded ? "Voucher credit returned" : "Gift voucher used",
        method: "voucher",
        customer: v.recipientName || v.buyerName,
        description: v.code,
        amount: use.amountPence / 100,
        ref: use.ref,
      });
    }
  }

  rows.sort((a, b) => a.at.localeCompare(b.at));
  const byTypeMap = new Map<string, { count: number; total: number }>();
  for (const r of rows) {
    const t = byTypeMap.get(r.type) ?? { count: 0, total: 0 };
    t.count += 1;
    t.total += r.amount;
    byTypeMap.set(r.type, t);
  }
  const sum = (f: (r: ReportRow) => boolean) => Math.round(rows.filter(f).reduce((x, r) => x + r.amount, 0) * 100) / 100;
  return {
    month,
    label,
    rows,
    byType: [...byTypeMap.entries()].map(([type, t]) => ({ type, count: t.count, total: Math.round(t.total * 100) / 100 })),
    cardIn: sum((r) => r.method === "card" && r.amount > 0),
    refunds: sum((r) => r.type === "Refund"),
    inPerson: sum((r) => r.method === "in person"),
    vouchersRedeemed: sum((r) => r.method === "voucher"),
  };
}

export function reportCsv(report: Report): string {
  const cell = (v: string | number) => {
    let s = String(v);
    if (/^[=+\-@]/.test(s) && typeof v === "string") s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["Date", "Type", "Method", "Customer", "Description", "Amount (GBP)", "Reference"];
  const lines = report.rows.map((r) =>
    [r.at.slice(0, 10), r.type, r.method, r.customer, r.description, r.amount.toFixed(2), r.ref].map(cell).join(",")
  );
  return [header.join(","), ...lines].join("\r\n");
}
