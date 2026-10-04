/**
 * Cal.com server-side client.
 *
 * Replaces lib/calendly.ts + lib/calendlyApi.ts. Unlike the Calendly setup,
 * nothing here takes a URL from the browser — callers pass a booking uid and
 * this module builds the URL itself, so a request can never be redirected at
 * an attacker's server with our credentials attached.
 */

const API = "https://api.cal.com/v2";

/** Cal.com versions endpoint groups separately. Bookings use this one. */
const V_BOOKINGS = "2026-02-25";

export type CalBooking = {
  uid: string;
  status: "upcoming" | "pending" | "cancelled" | "rejected" | "past";
  start: string;
  end: string;
  duration?: number;
  eventTypeId?: number;
  eventType?: { id?: number; slug?: string };
  attendees?: { name?: string; email?: string; timeZone?: string }[];
};

function apiKey(): string {
  const key = process.env.CAL_API_KEY;
  if (!key) throw new Error("CAL_API_KEY is not set");
  return key;
}

/** Booking uids are opaque alphanumeric ids. Reject anything else outright. */
const UID = /^[A-Za-z0-9_-]{6,64}$/;

function assertUid(uid: string): string {
  if (!UID.test(uid)) throw new Error("Invalid Cal.com booking uid");
  return uid;
}

type CalResponse<T> = { status?: string; data?: T };

async function call<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<CalResponse<T>> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "cal-api-version": V_BOOKINGS,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = (await res.json().catch(() => ({}))) as CalResponse<T>;
  if (!res.ok) {
    throw new Error(
      `Cal.com ${method} ${path} -> ${res.status}: ${JSON.stringify(json).slice(0, 400)}`
    );
  }
  return json;
}

/** Read a booking. Used to verify the browser's claim before we charge for it. */
export async function getCalBooking(uid: string): Promise<CalBooking | null> {
  try {
    const res = await call<CalBooking>("GET", `/bookings/${assertUid(uid)}`);
    return res.data ?? null;
  } catch (error) {
    console.error("Failed to fetch Cal.com booking:", error);
    return null;
  }
}

/**
 * Confirm a pending booking. Called from the Stripe webhook once payment has
 * actually landed — this is the only thing that turns a hold into a booking.
 */
export async function confirmCalBooking(uid: string): Promise<boolean> {
  try {
    await call<CalBooking>("POST", `/bookings/${assertUid(uid)}/confirm`);
    return true;
  } catch (error) {
    console.error("Failed to confirm Cal.com booking:", error);
    return false;
  }
}

/** Release a hold. Called by the expiry job and on explicit cancellation. */
export async function cancelCalBooking(uid: string, reason?: string): Promise<boolean> {
  try {
    await call<CalBooking>("POST", `/bookings/${assertUid(uid)}/cancel`, {
      cancellationReason: reason || "Payment not completed",
    });
    return true;
  } catch (error) {
    console.error("Failed to cancel Cal.com booking:", error);
    return false;
  }
}

/**
 * Verify a Cal.com webhook signature (HMAC SHA-256 of the raw body, sent as
 * x-cal-signature-256). Uses Web Crypto so this works on both runtimes.
 */
export async function verifyCalSignature(
  rawBody: string,
  signature: string | null
): Promise<boolean> {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare.
  const a = expected.toLowerCase();
  const b = signature.toLowerCase();
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ─── Event types, slots and server-created bookings ──────────────────────────

/** Event types use their own API version (see scripts/setup-calcom.ts). */
const V_EVENT_TYPES = "2026-06-12";
const V_SLOTS = "2024-09-04";

async function callVersion<T>(version: string, path: string): Promise<CalResponse<T>> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${apiKey()}`, "cal-api-version": version },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as CalResponse<T>;
  if (!res.ok) {
    throw new Error(`Cal.com GET ${path} -> ${res.status}: ${JSON.stringify(json).slice(0, 400)}`);
  }
  return json;
}

let eventTypeCache: { at: number; bySlug: Map<string, number> } | null = null;

/** Cal.com event type id for a package (event types are slugged by package id). */
export async function getEventTypeId(slug: string): Promise<number | null> {
  if (!eventTypeCache || Date.now() - eventTypeCache.at > 10 * 60 * 1000) {
    const res = await callVersion<{ id: number; slug: string }[]>(V_EVENT_TYPES, "/event-types");
    eventTypeCache = {
      at: Date.now(),
      bySlug: new Map((res.data ?? []).map((e) => [e.slug, e.id])),
    };
  }
  return eventTypeCache.bySlug.get(slug) ?? null;
}

/**
 * Bookable start times for an event type, grouped by London calendar date.
 * `start`/`end` are YYYY-MM-DD (inclusive). Unconfirmed holds already block
 * their slots, so anything returned here is genuinely free.
 */
export async function getAvailableSlots(
  eventTypeId: number,
  start: string,
  end: string
): Promise<Record<string, string[]>> {
  const qs = new URLSearchParams({
    eventTypeId: String(eventTypeId),
    start,
    end,
    timeZone: "Europe/London",
  });
  const res = await callVersion<unknown>(V_SLOTS, `/slots?${qs}`);
  const raw = (res.data ?? {}) as Record<string, unknown>;
  // Older response shapes nest the map under `slots`.
  const byDate = (raw.slots && typeof raw.slots === "object" ? raw.slots : raw) as Record<
    string,
    { start?: string; time?: string }[]
  >;
  const out: Record<string, string[]> = {};
  for (const [date, slots] of Object.entries(byDate)) {
    if (!Array.isArray(slots)) continue;
    const starts = slots
      .map((s) => s.start ?? s.time)
      .filter((s): s is string => typeof s === "string")
      .map((s) => new Date(s).toISOString());
    if (starts.length) out[date] = starts;
  }
  return out;
}

/**
 * Create a booking on the studio's behalf (block bookings, where the customer
 * picks several dates in our own picker). Event types require confirmation,
 * so this is an unconfirmed hold until the Stripe webhook confirms it.
 */
export async function createCalBooking(input: {
  eventTypeId: number;
  start: string;
  name: string;
  email: string;
  notes?: string;
}): Promise<CalBooking> {
  const res = await call<CalBooking>("POST", "/bookings", {
    start: new Date(input.start).toISOString(),
    eventTypeId: input.eventTypeId,
    attendee: { name: input.name, email: input.email, timeZone: "Europe/London", language: "en" },
    ...(input.notes ? { bookingFieldsResponses: { notes: input.notes } } : {}),
  });
  if (!res.data?.uid) throw new Error("Cal.com did not return a booking uid");
  return res.data;
}

/**
 * Whether a booking was made on the event type for this package. Without this
 * a customer could hold a cheap-looking slot on one event type and pay the
 * price of another. Returns null when Cal.com gave us nothing to compare.
 */
export async function bookingIsForPackage(
  booking: CalBooking,
  packageId: string
): Promise<boolean | null> {
  if (booking.eventType?.slug) return booking.eventType.slug === packageId;
  const id = booking.eventTypeId ?? booking.eventType?.id;
  if (id == null) return null;
  try {
    const expected = await getEventTypeId(packageId);
    return expected == null ? null : id === expected;
  } catch (error) {
    console.error("Could not look up Cal.com event types:", error);
    return null;
  }
}
