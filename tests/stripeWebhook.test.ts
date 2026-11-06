import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeRedis, type FakeRedis } from "./fakeRedis";

// ── Boundaries: Redis, Cal.com, Resend (via lib/email), Stripe, next/headers ──
const h = vi.hoisted(() => ({
  redis: null as unknown as FakeRedis,
  confirmCalBooking: vi.fn(),
  getCalBooking: vi.fn(),
  cancelCalBooking: vi.fn(),
  sendBookingNotification: vi.fn(),
  sendMembershipNotification: vi.fn(),
  sendStudioNotice: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({ getRedis: () => h.redis }));
vi.mock("@/lib/calcom", () => ({
  confirmCalBooking: h.confirmCalBooking,
  getCalBooking: h.getCalBooking,
  cancelCalBooking: h.cancelCalBooking,
}));
vi.mock("@/lib/email", () => ({
  sendBookingNotification: h.sendBookingNotification,
  sendMembershipNotification: h.sendMembershipNotification,
  sendStudioNotice: h.sendStudioNotice,
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "stripe-signature": "t=1,v1=test" }),
}));
vi.mock("stripe", () => ({
  default: class {
    // The body *is* the event in these tests; signature checking is Stripe's code.
    webhooks = { constructEvent: (body: string) => JSON.parse(body) };
    customers = { retrieve: async () => ({ name: "Member", email: "m@example.com" }) };
    checkout = { sessions: { list: async () => ({ data: [] }) } };
  },
}));

import { POST } from "@/app/api/webhooks/stripe/route";

process.env.STRIPE_SECRET_KEY = "sk_test_fake";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_fake";

function bookingSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "cs_test_session1",
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    payment_intent: "pi_123",
    customer_email: "ada@example.com",
    customer_details: { name: "Ada", email: "ada@example.com" },
    metadata: {
      customerName: "Ada",
      customerEmail: "ada@example.com",
      bookingDate: "Friday 6 November 2026",
      bookingHours: "10:00 – 14:00",
      totalPrice: "40.00",
      depositAmount: "20.00",
      balanceDue: "20.00",
      packageTitle: "Half day",
      pendingBookingId: "p1",
      calBookingUid: "calUid123",
    },
    ...overrides,
  };
}

let eventSeq = 0;
function deliver(type: string, object: unknown, id = `evt_${++eventSeq}`) {
  return POST(
    new Request("https://www.rtspaces.co.uk/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({ id, type, data: { object } }),
    })
  );
}

beforeEach(() => {
  h.redis = createFakeRedis();
  vi.clearAllMocks();
  h.confirmCalBooking.mockResolvedValue(true);
  h.getCalBooking.mockResolvedValue({ uid: "calUid123", status: "pending" });
  h.sendBookingNotification.mockResolvedValue(undefined);
  h.sendMembershipNotification.mockResolvedValue(undefined);
  h.sendStudioNotice.mockResolvedValue(undefined);
  // The hold the wizard created before checkout.
  h.redis.kv.set("pending:p1", {
    id: "p1",
    calBookingUid: "calUid123",
    customerName: "Ada",
    customerEmail: "ada@example.com",
    startTime: "2026-11-06T10:00:00Z",
    endTime: "2026-11-06T14:00:00Z",
    createdAt: "2026-11-05T10:00:00Z",
    expiresAt: "2026-11-05T10:36:00Z",
    status: "pending",
  });
});

describe("Stripe webhook: paid booking", () => {
  it("confirms the hold, saves the booking and emails, once", async () => {
    const res = await deliver("checkout.session.completed", bookingSession());
    expect(res.status).toBe(200);
    expect(h.confirmCalBooking).toHaveBeenCalledWith("calUid123");
    expect(h.sendBookingNotification).toHaveBeenCalledTimes(1);
    expect(h.redis.lists.get("bookings")).toHaveLength(1);
  });

  it("a duplicate delivery of the same event does nothing the second time", async () => {
    await deliver("checkout.session.completed", bookingSession(), "evt_dup");
    await deliver("checkout.session.completed", bookingSession(), "evt_dup");
    expect(h.sendBookingNotification).toHaveBeenCalledTimes(1);
    expect(h.redis.lists.get("bookings")).toHaveLength(1);
  });

  it("a Redis blip mid-way returns 500, and Stripe's retry still books it (finding #5)", async () => {
    h.redis.failOnce.add("pending:p1");
    const first = await deliver("checkout.session.completed", bookingSession(), "evt_retry");
    expect(first.status).toBe(500);

    // Stripe retries the SAME event id.
    const retry = await deliver("checkout.session.completed", bookingSession(), "evt_retry");
    expect(retry.status).toBe(200);
    expect(h.sendBookingNotification).toHaveBeenCalledTimes(1);
    expect(h.redis.lists.get("bookings")).toHaveLength(1);
  });

  it("does not confirm a session whose payment has not cleared (finding #9)", async () => {
    await deliver("checkout.session.completed", bookingSession({ payment_status: "unpaid" }));
    expect(h.confirmCalBooking).not.toHaveBeenCalled();
    expect(h.sendBookingNotification).not.toHaveBeenCalled();
  });

  it("books a delayed payment when async_payment_succeeded arrives (finding #9)", async () => {
    await deliver("checkout.session.async_payment_succeeded", bookingSession());
    expect(h.confirmCalBooking).toHaveBeenCalledWith("calUid123");
    expect(h.sendBookingNotification).toHaveBeenCalledTimes(1);
  });

  it("tells the studio when Cal.com refuses the confirm (finding #7)", async () => {
    h.confirmCalBooking.mockResolvedValue(false);
    h.getCalBooking.mockResolvedValue({ uid: "calUid123", status: "pending" });
    await deliver("checkout.session.completed", bookingSession());
    expect(h.sendBookingNotification).toHaveBeenCalledWith(
      expect.objectContaining({ paid: true, calConfirmed: false })
    );
  });

  it("does not raise a false alarm when a retry finds the hold already confirmed", async () => {
    h.confirmCalBooking.mockResolvedValue(false);
    h.getCalBooking.mockResolvedValue({ uid: "calUid123", status: "accepted" });
    await deliver("checkout.session.completed", bookingSession());
    expect(h.sendBookingNotification).toHaveBeenCalledWith(
      expect.objectContaining({ calConfirmed: true })
    );
  });

  it("waits for the emails before answering Stripe (finding #6)", async () => {
    let sent = false;
    h.sendBookingNotification.mockImplementation(
      () => new Promise<void>((resolve) => setTimeout(() => { sent = true; resolve(); }, 20))
    );
    await deliver("checkout.session.completed", bookingSession());
    expect(sent).toBe(true);
  });
});

describe("Stripe webhook: memberships (finding #4)", () => {
  const membership = {
    id: "cs_test_member1",
    object: "checkout.session",
    mode: "subscription",
    payment_status: "paid",
    subscription: "sub_1",
    amount_total: 25000,
    customer_email: null,
    customer_details: { name: "Grace", email: "grace@example.com" },
    metadata: { tierId: "signature" },
  };

  it("records the membership and emails the studio and the member", async () => {
    await deliver("checkout.session.completed", membership);
    expect(h.sendMembershipNotification).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Grace", email: "grace@example.com", tierName: "Signature Flex" })
    );
    expect(h.redis.lists.get("members")).toHaveLength(1);
    expect(h.sendBookingNotification).not.toHaveBeenCalled();
  });

  it("tells the studio when a membership is cancelled", async () => {
    await deliver("customer.subscription.deleted", {
      id: "sub_1",
      object: "subscription",
      customer: "cus_1",
      metadata: { tierId: "essentials" },
    });
    expect(h.sendStudioNotice).toHaveBeenCalledWith("Membership cancelled", expect.any(Array));
  });

  it("tells the studio when a renewal fails", async () => {
    await deliver("invoice.payment_failed", {
      id: "in_1",
      object: "invoice",
      customer: "cus_1",
      customer_email: "grace@example.com",
      amount_due: 25000,
    });
    expect(h.sendStudioNotice).toHaveBeenCalledWith("Membership payment failed", expect.any(Array));
  });
});

describe("Webhook and success page together", () => {
  it("whichever runs first books it; the other does nothing", async () => {
    const { finalizePaidSession } = await import("@/lib/finalizeBooking");
    const session = bookingSession();

    // Success page first (webhook delayed), then the webhook.
    const fromPage = await finalizePaidSession(session as never);
    expect(fromPage).toMatchObject({ status: "done", calConfirmed: true, alreadyDone: false });
    await deliver("checkout.session.completed", session);

    expect(h.sendBookingNotification).toHaveBeenCalledTimes(1);
    expect(h.redis.lists.get("bookings")).toHaveLength(1);
  });

  it("a session locked by the other caller makes the webhook ask Stripe to retry", async () => {
    h.redis.kv.set("stripe:lock:cs_test_session1", "1");
    const res = await deliver("checkout.session.completed", bookingSession());
    expect(res.status).toBe(409);
    expect(h.sendBookingNotification).not.toHaveBeenCalled();
  });
});
