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
