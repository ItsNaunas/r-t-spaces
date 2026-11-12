import Stripe from "stripe";
import { randomBytes } from "node:crypto";
import { getRedis } from "./redis";
import { loadSubject } from "./balance";
import { getManualBooking, isManualId } from "./manualBookings";
import { sendExtraChargeEmail, sendExtraPaidNotification } from "./email";

/**
 * Extra charges on a booking after it was made: overtime, an extra backdrop,
 * damage, a late fee. The studio either emails the customer a pay link
 * (/pay-extra/<token>, a fresh Stripe Checkout each click, priced on the
 * server) or records that it was paid in person.
 */
export type ExtraCharge = {
  id: string;
  bookingId: string;
  /** Pounds. */
  amount: number;
  reason: string;
  createdAt: string;
  /** Online charges: the pay-link token and the address it went to. */
  token?: string;
  sentTo?: string;
  paidAt?: string;
  /** IN_PERSON, or the Stripe Checkout session that paid it. */
  paidVia?: string;
  stripeSessionId?: string;
};

/** Quick picks on the form; the amount is always the studio's to set. */
export const EXTRA_REASONS = ["Overtime", "Extra backdrop", "Equipment hire", "Damage", "Late fee", "Cleaning", "Other"];

const IN_PERSON = "in-person";
const key = (id: string) => `extra:${id}`;
const byBooking = (bookingId: string) => `extra:booking:${bookingId}`;
const tokenKey = (token: string) => `extra:token:${token}`;
/** Every extra by when it was paid (or created, until it is), for reports. */
const ALL = "extra:all";
const TOKEN = /^[A-Za-z0-9_-]{24,64}$/;
const KEEP_SECONDS = 60 * 60 * 24 * 400;

function stripe(): Stripe {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k?.startsWith("sk_")) throw new Error("Stripe is not configured");
  return new Stripe(k, { apiVersion: "2025-11-17.clover" });
}

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://www.rtspaces.co.uk").replace(/\/$/, "");
}

async function save(e: ExtraCharge) {
  const redis = getRedis();
  await redis.set(key(e.id), e, { ex: KEEP_SECONDS });
  await redis.sadd(byBooking(e.bookingId), e.id);
  await redis.zadd(ALL, { score: Date.parse(e.paidAt ?? e.createdAt), member: e.id });
}

export async function getExtra(id: string): Promise<ExtraCharge | null> {
  return getRedis().get<ExtraCharge>(key(id));
}

export async function listExtras(bookingIds: string[]): Promise<Record<string, ExtraCharge[]>> {
  if (!bookingIds.length) return {};
  const redis = getRedis();
  const idsPipe = redis.pipeline();
  for (const b of bookingIds) idsPipe.smembers(byBooking(b));
  const idLists = await idsPipe.exec<string[][]>();
  const all = idLists.flat();
  if (!all.length) return {};
  const getPipe = redis.pipeline();
  for (const id of all) getPipe.get<ExtraCharge>(key(id));
  const extras = (await getPipe.exec<(ExtraCharge | null)[]>()).filter((e): e is ExtraCharge => Boolean(e));
  const out: Record<string, ExtraCharge[]> = {};
  for (const e of extras.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    (out[e.bookingId] ??= []).push(e);
  }
  return out;
}

/** Every extra created in [from, to), for the accountant's report. */
export async function listExtrasBetween(from: Date, to: Date): Promise<ExtraCharge[]> {
  const redis = getRedis();
  const ids = await redis.zrange<string[]>(ALL, from.getTime(), to.getTime(), { byScore: true });
  if (!ids.length) return [];
  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.get<ExtraCharge>(key(id));
  return (await pipeline.exec<(ExtraCharge | null)[]>()).filter((e): e is ExtraCharge => Boolean(e));
}

/** Who to bill and what to put on the email, for a booking id. */
async function bookingContact(bookingId: string) {
  const subject = await loadSubject(bookingId);
  if (!subject) return null;
  const manual = isManualId(bookingId) ? await getManualBooking(bookingId) : null;
  return { ...subject, email: subject.email || manual?.email || null };
}

export type ChargeResult = { extra: ExtraCharge; message: string };

export async function chargeExtra(
  bookingId: string,
  input: { amount: number; reason: string; paidInPerson: boolean; email?: string },
  now: Date = new Date()
): Promise<ChargeResult> {
  const contact = await bookingContact(bookingId);
  if (!contact) throw new Error("Booking not found");
  const extra: ExtraCharge = {
    id: `extra_${randomBytes(9).toString("base64url")}`,
    bookingId,
    amount: input.amount,
    reason: input.reason,
    createdAt: now.toISOString(),
  };

  if (input.paidInPerson) {
    await save({ ...extra, paidAt: now.toISOString(), paidVia: IN_PERSON });
    return { extra, message: `Recorded £${input.amount.toFixed(2)} paid in person.` };
  }

  const email = input.email || contact.email;
  if (!email) throw new Error("This booking has no email address. Enter one to send the link to.");
  const token = randomBytes(24).toString("base64url");
  const withToken = { ...extra, token, sentTo: email };
  await getRedis().set(tokenKey(token), extra.id, { ex: KEEP_SECONDS });
  await save(withToken);
  await sendExtraChargeEmail({
    name: contact.name,
    email,
    amount: input.amount.toFixed(2),
    reason: input.reason,
    payUrl: `${baseUrl()}/pay-extra/${token}`,
    bookingDate: contact.bookingDate,
    bookingHours: contact.bookingHours,
    packageTitle: contact.packageTitle,
  });
  return { extra: withToken, message: `Pay link for £${input.amount.toFixed(2)} sent to ${email}.` };
}

export async function markExtraPaidInPerson(id: string, now: Date = new Date()): Promise<ExtraCharge | null> {
  const extra = await getExtra(id);
  if (!extra) return null;
  if (extra.paidAt) return extra;
  const next = { ...extra, paidAt: now.toISOString(), paidVia: IN_PERSON };
  await save(next);
  return next;
}

export type ExtraCheckout = { kind: "redirect"; url: string } | { kind: "already_paid" } | { kind: "not_found" };

/** Behind /pay-extra/<token>. */
export async function createExtraCheckout(token: string): Promise<ExtraCheckout> {
  if (!TOKEN.test(token)) return { kind: "not_found" };
  const id = await getRedis().get<string>(tokenKey(token));
  const extra = id ? await getExtra(id) : null;
  if (!extra) return { kind: "not_found" };
  if (extra.paidAt) return { kind: "already_paid" };
  const contact = await bookingContact(extra.bookingId);

  const checkout = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: `RT Spaces: ${extra.reason}`.slice(0, 250),
            description: [contact?.packageTitle, contact?.bookingDate].filter(Boolean).join(", ").slice(0, 500) || undefined,
          },
          unit_amount: Math.round(extra.amount * 100),
        },
        quantity: 1,
      },
    ],
    ...(extra.sentTo ? { customer_email: extra.sentTo } : {}),
    success_url: `${baseUrl()}/book-online?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl()}/pay-extra/${token}`,
    metadata: {
      kind: "extra",
      extraId: extra.id,
      depositSessionId: extra.bookingId,
      customerName: contact?.name ?? "",
      customerEmail: extra.sentTo ?? "",
      reason: extra.reason,
      bookingDate: contact?.bookingDate ?? "",
      bookingHours: contact?.bookingHours ?? "",
      packageTitle: contact?.packageTitle ?? "",
    },
  });
  if (!checkout.url) throw new Error("Stripe did not return a checkout URL");
  return { kind: "redirect", url: checkout.url };
}

/** An extra's Checkout session was paid. Idempotency comes from finalizePaidSession. */
export async function recordExtraPaid(session: Stripe.Checkout.Session, stripeUrl?: string) {
  const meta = session.metadata ?? {};
  const extra = meta.extraId ? await getExtra(meta.extraId) : null;
  if (!extra) throw new Error(`extra session ${session.id} has no extra charge record`);
  if (!extra.paidAt) await save({ ...extra, paidAt: new Date().toISOString(), paidVia: session.id, stripeSessionId: session.id });
  const amount = ((session.amount_total ?? Math.round(extra.amount * 100)) / 100).toFixed(2);
  return {
    notify: () =>
      sendExtraPaidNotification({
        name: meta.customerName || session.customer_details?.name || "Customer",
        email: meta.customerEmail || session.customer_details?.email || "",
        amount,
        reason: extra.reason,
        bookingDate: meta.bookingDate || undefined,
        bookingHours: meta.bookingHours || undefined,
        packageTitle: meta.packageTitle || undefined,
        stripeUrl,
      }),
  };
}
