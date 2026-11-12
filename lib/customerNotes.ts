import { getRedis } from "./redis";

/**
 * The studio's private notes on a customer, and their no-shows. Keyed by
 * email. Never shown to customers; a previous no-show is flagged on the
 * studio's booking email and in the portal so the studio can decide.
 */
export type CustomerNote = {
  notes: string;
  noShows: { bookingId: string; at: string; when?: string }[];
  updatedAt: string;
};

const key = (email: string) => `customer:${email.trim().toLowerCase()}`;

export async function getCustomerNote(email: string): Promise<CustomerNote | null> {
  if (!email || email === "—") return null;
  return getRedis().get<CustomerNote>(key(email));
}

export async function getCustomerNotes(emails: string[]): Promise<Record<string, CustomerNote>> {
  const unique = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter((e) => e && e !== "—"))];
  if (!unique.length) return {};
  const pipeline = getRedis().pipeline();
  for (const e of unique) pipeline.get<CustomerNote>(key(e));
  const results = await pipeline.exec<(CustomerNote | null)[]>();
  const out: Record<string, CustomerNote> = {};
  unique.forEach((e, i) => {
    if (results[i]) out[e] = results[i]!;
  });
  return out;
}

export async function setCustomerNotes(email: string, notes: string, now: Date = new Date()): Promise<CustomerNote> {
  const current = (await getCustomerNote(email)) ?? { notes: "", noShows: [], updatedAt: now.toISOString() };
  const next = { ...current, notes: notes.slice(0, 2000), updatedAt: now.toISOString() };
  await getRedis().set(key(email), next);
  return next;
}

/** Mark a booking as a no-show (once per booking). */
export async function addNoShow(email: string, bookingId: string, when?: string, now: Date = new Date()): Promise<CustomerNote> {
  const current = (await getCustomerNote(email)) ?? { notes: "", noShows: [], updatedAt: now.toISOString() };
  if (current.noShows.some((n) => n.bookingId === bookingId)) return current;
  const next = { ...current, noShows: [...current.noShows, { bookingId, at: now.toISOString(), when }], updatedAt: now.toISOString() };
  await getRedis().set(key(email), next);
  return next;
}

export async function removeNoShow(email: string, bookingId: string, now: Date = new Date()): Promise<void> {
  const current = await getCustomerNote(email);
  if (!current) return;
  await getRedis().set(key(email), { ...current, noShows: current.noShows.filter((n) => n.bookingId !== bookingId), updatedAt: now.toISOString() });
}

/** The warning for the studio's booking email, or undefined. */
export async function studioWarningFor(email: string): Promise<string | undefined> {
  const note = await getCustomerNote(email).catch(() => null);
  const count = note?.noShows.length ?? 0;
  if (!count) return undefined;
  return `This customer didn't show up to ${count === 1 ? "a previous booking" : `${count} previous bookings`}.`;
}
