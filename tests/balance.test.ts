import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeRedis, type FakeRedis } from "./fakeRedis";

const h = vi.hoisted(() => ({
  redis: null as unknown as FakeRedis,
  getCalBooking: vi.fn(),
  sendBalanceLinkEmail: vi.fn(),
  sendBalancePaidNotification: vi.fn(),
  sessions: [] as Record<string, unknown>[],
  create: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({ getRedis: () => h.redis }));
vi.mock("@/lib/calcom", () => ({ getCalBooking: h.getCalBooking }));
vi.mock("@/lib/email", () => ({
  sendBalanceLinkEmail: h.sendBalanceLinkEmail,
  sendBalancePaidNotification: h.sendBalancePaidNotification,
}));
vi.mock("stripe", () => ({
  default: class {
    checkout = {
      sessions: {
        list: () => ({ autoPagingToArray: async () => h.sessions }),
        retrieve: async (id: string) => h.sessions.find((s) => s.id === id),
        create: h.create,
      },
    };
  },
}));

import * as balance from "@/lib/balance";

process.env.STRIPE_SECRET_KEY = "sk_test_fake";
process.env.NEXT_PUBLIC_BASE_URL = "https://www.rtspaces.co.uk";

const NOW = new Date("2026-11-06T08:00:00Z");
const hoursFromNow = (h: number) => new Date(NOW.getTime() + h * 3600_000).toISOString();

function deposit(id: string, overrides: { meta?: Record<string, string>; session?: Record<string, unknown> } = {}) {
  return {
    id,
    mode: "payment",
    payment_status: "paid",
    customer_email: "ada@example.com",
    metadata: {
      customerName: "Ada",
      customerEmail: "ada@example.com",
      bookingDate: "Sunday 8 November 2026",
      bookingHours: "13:00 – 14:00",
      packageTitle: "Student Studio Hire",
      balanceDue: "15.00",
      calBookingUid: `cal_${id}`,
      ...overrides.meta,
    },
    ...overrides.session,
  };
}

beforeEach(() => {
  h.redis = createFakeRedis();
  vi.clearAllMocks();
  h.sessions = [];
  h.sendBalanceLinkEmail.mockResolvedValue(undefined);
  h.sendBalancePaidNotification.mockResolvedValue(undefined);
  h.getCalBooking.mockImplementation(async (uid: string) => ({
    uid,
    status: "accepted",
    start: hoursFromNow(53), // Sunday 1pm, seen from Friday 8am
  }));
  h.create.mockResolvedValue({ id: "cs_test_balance1", url: "https://checkout.stripe.com/c/pay/cs_test_balance1" });
});

describe("Daily balance links", () => {
  it("emails the link for a session ~2 days away, exactly once", async () => {
    h.sessions = [deposit("cs_test_viktoriia")];
    expect(await balance.sendDueBalanceLinks(NOW)).toMatchObject({ checked: 1, sent: 1 });
    expect(h.sendBalanceLinkEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@example.com",
        amount: "15.00",
        payUrl: expect.stringMatching(/^https:\/\/www\.rtspaces\.co\.uk\/pay-balance\/[A-Za-z0-9_-]{24,}$/),
      })
    );

    // The next day's run must not email again.
    expect(await balance.sendDueBalanceLinks(new Date(NOW.getTime() + 24 * 3600_000))).toMatchObject({ sent: 0 });
    expect(h.sendBalanceLinkEmail).toHaveBeenCalledTimes(1);
  });

  it("uses the start time stored at checkout when there is one", async () => {
    h.sessions = [deposit("cs_test_new", { meta: { sessionStart: hoursFromNow(200) } })];
    expect(await balance.sendDueBalanceLinks(NOW)).toMatchObject({ sent: 0 });
  });

  it("waits for sessions more than 3 days away, and skips past sessions", async () => {
    h.getCalBooking.mockImplementation(async (uid: string) => ({
      uid,
      status: "accepted",
      start: uid === "cal_cs_test_far" ? hoursFromNow(13 * 24) : hoursFromNow(-5),
    }));
    h.sessions = [deposit("cs_test_far"), deposit("cs_test_past")];
    expect(await balance.sendDueBalanceLinks(NOW)).toMatchObject({ sent: 0 });
  });

  it("skips cancelled bookings (a full refund cancels them in Cal.com)", async () => {
    h.getCalBooking.mockResolvedValue({ uid: "x", status: "cancelled", start: hoursFromNow(50) });
    h.sessions = [deposit("cs_test_refunded")];
    expect(await balance.sendDueBalanceLinks(NOW)).toMatchObject({ sent: 0 });
  });

  it("skips bookings with nothing left to pay, memberships and balance payments", async () => {
    h.sessions = [
      deposit("cs_test_zero", { meta: { balanceDue: "0.00" } }),
      deposit("cs_test_bal", { meta: { kind: "balance" } }),
      { id: "cs_test_member", mode: "subscription", payment_status: "paid", metadata: { tierId: "signature" } },
    ];
    expect(await balance.sendDueBalanceLinks(NOW)).toMatchObject({ sent: 0 });
    expect(h.sendBalanceLinkEmail).not.toHaveBeenCalled();
  });

  it("a failed email is retried on the next run, reusing the same link", async () => {
    h.sessions = [deposit("cs_test_retry")];
    h.sendBalanceLinkEmail.mockRejectedValueOnce(new Error("Resend down"));
    expect(await balance.sendDueBalanceLinks(NOW)).toMatchObject({ sent: 0, failed: 1 });

    expect(await balance.sendDueBalanceLinks(NOW)).toMatchObject({ sent: 1 });
    const [first, second] = h.sendBalanceLinkEmail.mock.calls.map((c) => c[0].payUrl);
    expect(second).toBe(first);
  });
});

describe("Paying through the link", () => {
  async function sendLinkFor(id: string) {
    h.sessions = [deposit(id)];
    await balance.sendDueBalanceLinks(NOW);
    return h.sendBalanceLinkEmail.mock.calls[0][0].payUrl.split("/").pop() as string;
  }

  it("opens a Stripe checkout for exactly what is owed, priced on the server", async () => {
    const token = await sendLinkFor("cs_test_viktoriia");
    const result = await balance.createBalanceCheckout(token);
    expect(result).toEqual({ kind: "redirect", url: "https://checkout.stripe.com/c/pay/cs_test_balance1" });
    const args = h.create.mock.calls[0][0];
    expect(args.line_items[0].price_data.unit_amount).toBe(1500);
    expect(args.metadata).toMatchObject({ kind: "balance", depositSessionId: "cs_test_viktoriia" });
  });

  it("rejects unknown or malformed tokens", async () => {
    expect(await balance.createBalanceCheckout("not-a-real-token-at-all-xyz")).toEqual({ kind: "not_found" });
    expect(await balance.createBalanceCheckout("../../etc")).toEqual({ kind: "not_found" });
    expect(h.create).not.toHaveBeenCalled();
  });

  it("once the balance is paid the link says so, and no more links go out", async () => {
    const token = await sendLinkFor("cs_test_viktoriia");
    const { notify } = await balance.recordBalancePaid({
      id: "cs_test_balance1",
      amount_total: 1500,
      metadata: { kind: "balance", depositSessionId: "cs_test_viktoriia", customerName: "Ada", customerEmail: "ada@example.com" },
    } as never);
    await notify();
    expect(h.sendBalancePaidNotification).toHaveBeenCalledWith(expect.objectContaining({ amount: "15.00" }));

    expect(await balance.createBalanceCheckout(token)).toEqual({ kind: "already_paid" });
    expect(h.create).not.toHaveBeenCalled();
    expect(await balance.getBalanceStatus("cs_test_viktoriia")).toMatchObject({ paidAt: expect.any(String) });
  });
});
