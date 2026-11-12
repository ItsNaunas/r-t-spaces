import { randomInt } from "node:crypto";
import { getRedis } from "./redis";

/**
 * Gift vouchers: money on a code, not a percentage off. Sold on
 * /gift-vouchers (or issued by hand in the portal), entered in the same box
 * as discount codes. A voucher pays the deposit first, then the balance, and
 * whatever is left stays on the code for next time.
 *
 * The balance is kept in whole pence under its own key so spending is one
 * atomic DECRBY: two bookings racing for the same voucher can never spend
 * more than it holds. Every spend is recorded once per booking reference.
 */
export type Voucher = {
  code: string;
  /** Pence, as issued. */
  amountPence: number;
  createdAt: string;
  expiresAt: string;
  source: "purchase" | "manual";
  buyerName: string;
  buyerEmail: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  /** Stripe Checkout session that paid for it (purchases). */
  stripeSessionId?: string;
  /** Set when the studio switches a voucher off. */
  voidedAt?: string;
};

export type VoucherUse = { at: string; amountPence: number; ref: string; refunded?: boolean };

export const VOUCHER_EXPIRY_MONTHS = 12;
export const VOUCHER_AMOUNTS = [25, 50, 100];
export const VOUCHER_MIN = 10;
export const VOUCHER_MAX = 500;

const CODE = /^RT-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const KEEP_SECONDS = 60 * 60 * 24 * 365 * 3;

const recordKey = (code: string) => `voucher:${code}`;
const balanceKey = (code: string) => `voucher:bal:${code}`;
const usesKey = (code: string) => `voucher:uses:${code}`;
const spentKey = (code: string, ref: string) => `voucher:spent:${code}:${ref}`;
const ALL = "voucher:all";

/** Upper-case and tidy what a customer typed. */
export function normaliseCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export const looksLikeVoucher = (raw: string) => CODE.test(normaliseCode(raw));

function newCode(): string {
  const part = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `RT-${part()}-${part()}`;
}

function expiryFrom(now: Date): string {
  const d = new Date(now);
  d.setUTCMonth(d.getUTCMonth() + VOUCHER_EXPIRY_MONTHS);
  return d.toISOString();
}

export async function issueVoucher(
  input: Omit<Voucher, "code" | "createdAt" | "expiresAt">,
  now: Date = new Date()
): Promise<Voucher> {
  const redis = getRedis();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    const voucher: Voucher = { ...input, code, createdAt: now.toISOString(), expiresAt: expiryFrom(now) };
    // NX: never overwrite an existing voucher with a clashing code.
    if (!(await redis.set(recordKey(code), voucher, { nx: true, ex: KEEP_SECONDS }))) continue;
    await redis.set(balanceKey(code), input.amountPence, { ex: KEEP_SECONDS });
    await redis.zadd(ALL, { score: now.getTime(), member: code });
    return voucher;
  }
  throw new Error("Could not create a unique voucher code");
}

export async function getVoucher(code: string): Promise<(Voucher & { balancePence: number }) | null> {
  const c = normaliseCode(code);
  if (!CODE.test(c)) return null;
  const redis = getRedis();
  const voucher = await redis.get<Voucher>(recordKey(c));
  if (!voucher) return null;
  const balancePence = Number((await redis.get(balanceKey(c))) ?? 0);
  return { ...voucher, balancePence };
}

export type VoucherCheck =
  | { ok: true; code: string; balancePence: number }
  | { ok: false; error: string };

export async function checkVoucher(code: string, now: Date = new Date()): Promise<VoucherCheck> {
  const v = await getVoucher(code);
  if (!v) return { ok: false, error: "Code not found" };
  if (v.voidedAt) return { ok: false, error: "This voucher is no longer valid" };
  if (Date.parse(v.expiresAt) <= now.getTime()) return { ok: false, error: "This voucher has expired" };
  if (v.balancePence <= 0) return { ok: false, error: "This voucher has been used up" };
  return { ok: true, code: v.code, balancePence: v.balancePence };
}

/**
 * Take `pence` off a voucher for booking `ref`. Idempotent per ref (a retried
 * webhook spends once). Returns the pence actually taken: less than asked if
 * the voucher ran low in the meantime, 0 if it was already empty.
 */
export async function spendVoucher(code: string, pence: number, ref: string, now: Date = new Date()): Promise<number> {
  const c = normaliseCode(code);
  const redis = getRedis();
  const already = await redis.get<number>(spentKey(c, ref));
  if (already != null) return Number(already);
  if (pence <= 0) return 0;

  const after = await redis.decrby(balanceKey(c), pence);
  let taken = pence;
  if (after < 0) {
    // Overdrawn by a race: give back what wasn't there.
    const giveBack = Math.min(pence, -after);
    await redis.incrby(balanceKey(c), giveBack);
    taken = pence - giveBack;
  }
  await redis.set(spentKey(c, ref), taken, { ex: KEEP_SECONDS });
  if (taken > 0) await redis.rpush(usesKey(c), JSON.stringify({ at: now.toISOString(), amountPence: taken, ref }));
  return taken;
}

/** Undo a spend for `ref` (a booking that fell through), once. */
export async function restoreVoucher(code: string, ref: string, now: Date = new Date()): Promise<number> {
  const c = normaliseCode(code);
  const redis = getRedis();
  const spent = Number((await redis.get(spentKey(c, ref))) ?? 0);
  if (spent <= 0) return 0;
  await redis.incrby(balanceKey(c), spent);
  await redis.set(spentKey(c, ref), 0, { ex: KEEP_SECONDS });
  await redis.rpush(usesKey(c), JSON.stringify({ at: now.toISOString(), amountPence: -spent, ref, refunded: true }));
  return spent;
}

export async function listVoucherUses(code: string): Promise<VoucherUse[]> {
  return (await getRedis().lrange<VoucherUse>(usesKey(normaliseCode(code)), 0, -1)) ?? [];
}

/** Every voucher, newest first, with what is left on it. */
export async function listVouchers(): Promise<(Voucher & { balancePence: number })[]> {
  const redis = getRedis();
  const codes = await redis.zrange<string[]>(ALL, 0, Date.now() + 1, { byScore: true });
  if (!codes.length) return [];
  const pipeline = redis.pipeline();
  for (const c of codes) {
    pipeline.get<Voucher>(recordKey(c));
    pipeline.get<number>(balanceKey(c));
  }
  const results = await pipeline.exec<unknown[]>();
  const out: (Voucher & { balancePence: number })[] = [];
  codes.forEach((_, i) => {
    const v = results[i * 2] as Voucher | null;
    if (v) out.push({ ...v, balancePence: Number(results[i * 2 + 1] ?? 0) });
  });
  return out.reverse();
}

export async function voidVoucher(code: string, now: Date = new Date()): Promise<boolean> {
  const v = await getVoucher(code);
  if (!v) return false;
  const { balancePence: _balance, ...record } = v;
  void _balance;
  await getRedis().set(recordKey(v.code), { ...record, voidedAt: now.toISOString() }, { ex: KEEP_SECONDS });
  return true;
}

/**
 * How a voucher pays for a booking: the deposit first, then the balance.
 * All in pence. `chargeNow` is what is still taken by card today.
 */
export function splitVoucher(balancePence: number, depositPence: number, balanceDuePence: number) {
  const applied = Math.max(0, Math.min(balancePence, depositPence + balanceDuePence));
  const toDeposit = Math.min(applied, depositPence);
  const toBalance = applied - toDeposit;
  return { applied, toDeposit, toBalance, chargeNow: depositPence - toDeposit, balanceAfter: balanceDuePence - toBalance };
}
