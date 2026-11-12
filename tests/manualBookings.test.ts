import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeRedis, type FakeRedis } from "./fakeRedis";

const h = vi.hoisted(() => ({
  redis: null as unknown as FakeRedis,
  cal: {
    createCalBooking: vi.fn(),
    confirmCalBooking: vi.fn(),
    cancelCalBooking: vi.fn(),
    getEventTypeId: vi.fn(),
    getCalBooking: vi.fn(),
  },
  email: {
    sendBalanceLinkEmail: vi.fn(),
    sendBalancePaidNotification: vi.fn(),
    sendManualBookingConfirmation: vi.fn(),
  },
  sessions: [] as Record<string, unknown>[],
  checkoutCreate: vi.fn(),
  refundsCreate: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({ getRedis: () => h.redis }));
vi.mock("@/lib/calcom", () => h.cal);
vi.mock("@/lib/email", () => h.email);
vi.mock("@/lib/admin/pricing-merged", () => ({
  getMergedPackages: async () => [
    { id: "signature-studio", title: "Signature Studio Session", price: 165, hours: 3, enabled: true, includes: [], duration: "" },
    { id: "standard-rate", title: "Studio Hire", price: 0, hours: 2, priceFromTime: true, hourlyRate: 55, minimumHours: 2, enabled: true, includes: [], duration: "" },
  ],
}));
vi.mock("stripe", () => ({
  default: class {
    checkout = {
      sessions: {
        list: () => ({ autoPagingToArray: async () => h.sessions }),
        retrieve: async (id: string) => h.sessions.find((s) => s.id === id),
        create: h.checkoutCreate,
      },
    };
    refunds = { create: h.refundsCreate };
  },
}));

import * as actions from "@/lib/admin/bookingActions";
import * as balance from "@/lib/balance";
import { getManualBooking } from "@/lib/manualBookings";

process.env.STRIPE_SECRET_KEY = "sk_test_fake";
process.env.NEXT_PUBLIC_BASE_URL = "https://www.rtspaces.co.uk";

const inDays = (d: number, hour = 13) => {
  const t = new Date(Date.now() + d * 86400_000);
  t.setUTCHours(hour, 0, 0, 0);
  return t.toISOString();
};

const form = (overrides: Record<string, unknown> = {}) =>
  actions.parseManualBookingInput({
    packageId: "signature-studio",
    start: inDays(10),
    name: "Walk In",
    email: "walkin@example.com",
    phone: "07700 900000",
    totalPrice: 165,
    paidUpfront: 50,
    emailCustomer: true,
    ...overrides,
  });

beforeEach(() => {
  h.redis = createFakeRedis();
  vi.clearAllMocks();
  h.sessions = [];
  h.cal.getEventTypeId.mockResolvedValue(42);
  h.cal.createCalBooking.mockImplementation(async (input: { start: string }) => ({
    uid: "calManual123",
    status: "pending",
    start: input.start,
    end: new Date(Date.parse(input.start) + 3 * 3600_000).toISOString(),
  }));
  h.cal.confirmCalBooking.mockResolvedValue(true);
  h.cal.cancelCalBooking.mockResolvedValue(true);
  h.cal.getCalBooking.mockImplementation(async (uid: string) => ({ uid, status: "accepted", start: inDays(10) }));
  Object.values(h.email).forEach((f) => f.mockResolvedValue(undefined));
  h.checkoutCreate.mockResolvedValue({ id: "cs_test_bal", url: "https://checkout.stripe.com/c/pay/cs_test_bal" });
  h.refundsCreate.mockResolvedValue({ id: "re_1" });
});

describe("Adding a booking by hand", () => {
  it("books and confirms it in Cal.com, so the slot is taken, and emails the customer", async () => {
    const { booking } = await actions.createManualBooking(form());
    expect(h.cal.createCalBooking).toHaveBeenCalledWith(expect.objectContaining({ eventTypeId: 42, email: "walkin@example.com" }));
    expect(h.cal.confirmCalBooking).toHaveBeenCalledWith("calManual123");
    expect(booking).toMatchObject({ id: expect.stringMatching(/^manual_/), totalPrice: 165, paidUpfront: 50 });
    expect(await getManualBooking(booking.id)).toMatchObject({ calBookingUid: "calManual123" });
    expect(h.email.sendManualBookingConfirmation).toHaveBeenCalledWith(expect.objectContaining({ amount: "115.00" }));
    // 10 days away: the balance link waits for the daily job.
    expect(h.email.sendBalanceLinkEmail).not.toHaveBeenCalled();
  });

  it("books hourly hire for the hours chosen", async () => {
    await actions.createManualBooking(form({ packageId: "standard-rate", hours: 4, totalPrice: 220 }));
    expect(h.cal.createCalBooking).toHaveBeenCalledWith(expect.objectContaining({ lengthInMinutes: 240 }));
  });

  it("sends nothing to the customer when the box is unticked, and needs no email", async () => {
    await actions.createManualBooking(form({ email: "", emailCustomer: false }));
    expect(h.cal.createCalBooking).toHaveBeenCalledWith(expect.objectContaining({ email: "enquires@rtspaces.co.uk" }));
    expect(h.email.sendManualBookingConfirmation).not.toHaveBeenCalled();
  });

  it("cancels again if Cal.com won't confirm, rather than leave a half-booking", async () => {
    h.cal.confirmCalBooking.mockResolvedValue(false);
    await expect(actions.createManualBooking(form())).rejects.toThrow(/wouldn't confirm/);
    expect(h.cal.cancelCalBooking).toHaveBeenCalledWith("calManual123", expect.any(String));
  });

  it("rejects bad input before touching Cal.com", () => {
    expect(() => form({ paidUpfront: 200 })).toThrow(/more than the total/);
    expect(() => form({ email: "", emailCustomer: true })).toThrow(/email/);
    expect(() => form({ start: inDays(-2) })).toThrow(/passed/);
    expect(() => form({ totalPrice: -5 })).toThrow(/between/);
  });
});

describe("Balances on manual bookings", () => {
  it("booked inside the 3-day window, the link goes out at once, and paying it marks the booking paid", async () => {
    const { booking } = await actions.createManualBooking(form({ start: inDays(2, 18) }));
    expect(h.email.sendBalanceLinkEmail).toHaveBeenCalledTimes(1);

    const status = await balance.getBalanceStatus(booking.id);
    expect(status).toMatchObject({ amount: "115.00", linkSentAt: expect.any(String) });

    const result = await balance.createBalanceCheckout(status!.token);
    expect(result).toMatchObject({ kind: "redirect" });
    expect(h.checkoutCreate.mock.calls[0][0]).toMatchObject({
      line_items: [expect.objectContaining({ price_data: expect.objectContaining({ unit_amount: 11500 }) })],
      metadata: expect.objectContaining({ kind: "balance", depositSessionId: booking.id }),
    });

    await balance.recordBalancePaid({
      id: "cs_test_bal",
      amount_total: 11500,
      metadata: { kind: "balance", depositSessionId: booking.id },
    } as never);
    expect((await getManualBooking(booking.id))?.paidInFullAt).toEqual(expect.any(String));
  });

  it("customers who asked not to be emailed get no automatic link", async () => {
    const { booking } = await actions.createManualBooking(form({ start: inDays(2, 18), emailCustomer: false }));
    await balance.sendDueBalanceLinks();
    expect(h.email.sendBalanceLinkEmail).not.toHaveBeenCalled();
    // ...but the studio can still send one on purpose.
    expect(await actions.sendLinkNow(booking.id)).toMatch(/sent/);
    expect(h.email.sendBalanceLinkEmail).toHaveBeenCalledWith(expect.objectContaining({ email: "walkin@example.com" }));
  });

  it("marking paid in person stops the links", async () => {
    const { booking } = await actions.createManualBooking(form({ start: inDays(2, 18), emailCustomer: false }));
    await actions.markPaid(booking.id);
    await expect(actions.sendLinkNow(booking.id)).rejects.toThrow(/already paid/);
  });
});

function onlineDeposit(id: string, extra: Record<string, string> = {}) {
  return {
    id,
    mode: "payment",
    payment_status: "paid",
    amount_total: 2000,
    payment_intent: `pi_${id}`,
    metadata: {
      customerName: "Ada",
      customerEmail: "ada@example.com",
      balanceDue: "15.00",
      calBookingUid: "calOnline1",
      sessionStart: inDays(5),
      ...extra,
    },
  };
}

describe("Buttons on online bookings", () => {
  it("cancel frees the slot in Cal.com and refunds nothing", async () => {
    h.sessions = [onlineDeposit("cs_test_ada")];
    expect(await actions.cancelBooking("cs_test_ada")).toMatch(/Nothing was refunded/);
    expect(h.cal.cancelCalBooking).toHaveBeenCalledWith("calOnline1", expect.any(String));
    expect(h.refundsCreate).not.toHaveBeenCalled();
    expect(await actions.getCancelledFlags(["cs_test_ada"])).toEqual(new Set(["cs_test_ada"]));
  });

  it("refunding the deposit refunds it in Stripe and cancels the booking", async () => {
    h.sessions = [onlineDeposit("cs_test_ada")];
    expect(await actions.refundBooking("cs_test_ada", "deposit")).toMatch(/deposit £20.00/);
    expect(h.refundsCreate).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: "pi_cs_test_ada" }));
    expect(h.cal.cancelCalBooking).toHaveBeenCalled();
  });

  it("refunding only the balance keeps the booking and makes the balance owed again", async () => {
    h.sessions = [onlineDeposit("cs_test_ada"), { id: "cs_test_balpay", payment_intent: "pi_bal", metadata: {} }];
    await balance.recordBalancePaid({
      id: "cs_test_balpay",
      amount_total: 1500,
      metadata: { kind: "balance", depositSessionId: "cs_test_ada" },
    } as never);
    expect(await actions.refundBooking("cs_test_ada", "balance")).toMatch(/balance £15.00/);
    expect(h.refundsCreate).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: "pi_bal" }));
    expect(h.cal.cancelCalBooking).not.toHaveBeenCalled();
    expect(await balance.getBalanceStatus("cs_test_ada")).toMatchObject({ refundedAt: expect.any(String) });
    expect((await balance.getBalanceStatus("cs_test_ada"))?.paidAt).toBeUndefined();
  });

  it("won't refund a balance that was paid in person", async () => {
    h.sessions = [onlineDeposit("cs_test_ada")];
    await actions.markPaid("cs_test_ada");
    await expect(actions.refundBooking("cs_test_ada", "balance")).rejects.toThrow(/in person/);
    expect(h.refundsCreate).not.toHaveBeenCalled();
  });

  it("only acts on real booking ids", async () => {
    await expect(actions.cancelBooking("../../etc")).rejects.toThrow(/not found/);
    await expect(actions.refundBooking("manual_abc", "deposit")).rejects.toThrow(/in person/);
  });
});
