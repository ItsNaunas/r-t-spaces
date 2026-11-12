import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeRedis, type FakeRedis } from "./fakeRedis";

const h = vi.hoisted(() => ({
  redis: null as unknown as FakeRedis,
  cal: {
    getCalBooking: vi.fn(),
    confirmCalBooking: vi.fn(),
    cancelCalBooking: vi.fn(),
    createCalBooking: vi.fn(),
    getEventTypeId: vi.fn(),
    rescheduleCalBooking: vi.fn(),
  },
  email: {} as Record<string, ReturnType<typeof vi.fn>>,
  sessions: [] as Record<string, unknown>[],
  checkoutCreate: vi.fn(),
  subRetrieve: vi.fn(),
  subUpdate: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({ getRedis: () => h.redis }));
vi.mock("@/lib/calcom", () => h.cal);
vi.mock("@/lib/email", () => {
  const names = [
    "sendBalanceLinkEmail",
    "sendBalancePaidNotification",
    "sendManualBookingConfirmation",
    "sendBookingNotification",
    "sendVoucherEmails",
    "sendExtraChargeEmail",
    "sendExtraPaidNotification",
    "sendBookingMovedEmail",
    "sendAlertEmail",
    "sendMembershipNotification",
  ];
  for (const n of names) h.email[n] = vi.fn();
  return h.email;
});
vi.mock("@/lib/admin/pricing-merged", () => ({
  getMergedPackages: async () => [
    { id: "signature-studio", title: "Signature Studio Session", price: 165, hours: 3, enabled: true, includes: [], duration: "" },
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
    refunds = { create: vi.fn() };
    subscriptions = { retrieve: h.subRetrieve, update: h.subUpdate };
  },
}));

import * as vouchers from "@/lib/vouchers";
import { bookWithVoucher, VoucherBookingError } from "@/lib/voucherBooking";
import { finalizePaidSession } from "@/lib/finalizeBooking";
import * as extras from "@/lib/extras";
import { recordMove, resolveCalUid } from "@/lib/calMoves";
import { sendBalanceLinkIfDue } from "@/lib/balance";
import * as actions from "@/lib/admin/bookingActions";
import { alert, listAlerts } from "@/lib/alerts";
import { studioWarningFor } from "@/lib/customerNotes";
import { cancelMember } from "@/lib/admin/members";
import { monthRange } from "@/lib/admin/report";
import { createBlock, listBlocks, removeBlock } from "@/lib/admin/blocks";
import { getManualBooking } from "@/lib/manualBookings";
import { listActivity } from "@/lib/activity";

process.env.STRIPE_SECRET_KEY = "sk_test_fake";
process.env.NEXT_PUBLIC_BASE_URL = "https://www.rtspaces.co.uk";

const inHours = (hrs: number) => new Date(Date.now() + hrs * 3600_000).toISOString();

beforeEach(() => {
  h.redis = createFakeRedis();
  vi.clearAllMocks();
  h.sessions = [];
  Object.values(h.email).forEach((f) => f.mockResolvedValue(undefined));
  h.cal.confirmCalBooking.mockResolvedValue(true);
  h.cal.cancelCalBooking.mockResolvedValue(true);
  h.cal.getEventTypeId.mockResolvedValue(7);
  h.cal.getCalBooking.mockImplementation(async (uid: string) => ({ uid, status: "accepted", start: inHours(240), end: inHours(243) }));
  h.checkoutCreate.mockResolvedValue({ id: "cs_test_new", url: "https://checkout.stripe.com/c/pay/cs_test_new" });
  delete process.env.ALERT_EMAIL;
});

const voucher = (pence: number) =>
  vouchers.issueVoucher({ amountPence: pence, source: "purchase", buyerName: "Bea", buyerEmail: "bea@example.com" });

describe("Gift vouchers", () => {
  it("issues a code that checks out with its full value", async () => {
    const v = await voucher(5000);
    expect(v.code).toMatch(/^RT-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(await vouchers.checkVoucher(v.code.toLowerCase())).toEqual({ ok: true, code: v.code, balancePence: 5000 });
  });

  it("pays the deposit first, then the balance", () => {
    expect(vouchers.splitVoucher(5000, 8250, 8250)).toMatchObject({ toDeposit: 5000, toBalance: 0, chargeNow: 3250, balanceAfter: 8250 });
    expect(vouchers.splitVoucher(10000, 8250, 8250)).toMatchObject({ toDeposit: 8250, toBalance: 1750, chargeNow: 0, balanceAfter: 6500 });
    expect(vouchers.splitVoucher(50000, 8250, 8250)).toMatchObject({ applied: 16500, chargeNow: 0, balanceAfter: 0 });
  });

  it("spends once per booking, and never more than it holds", async () => {
    const v = await voucher(5000);
    expect(await vouchers.spendVoucher(v.code, 3000, "cs_1")).toBe(3000);
    expect(await vouchers.spendVoucher(v.code, 3000, "cs_1")).toBe(3000); // retry: no second spend
    expect(await vouchers.spendVoucher(v.code, 3000, "cs_2")).toBe(2000); // only 20 left
    expect((await vouchers.getVoucher(v.code))?.balancePence).toBe(0);
    expect(await vouchers.checkVoucher(v.code)).toMatchObject({ ok: false, error: expect.stringMatching(/used up/) });
  });

  it("refuses switched-off and unknown codes", async () => {
    const v = await voucher(5000);
    await vouchers.voidVoucher(v.code);
    expect(await vouchers.checkVoucher(v.code)).toMatchObject({ ok: false });
    expect(await vouchers.checkVoucher("RT-AAAA-BBBB")).toMatchObject({ ok: false, error: "Code not found" });
  });

  it("a voucher that covers the deposit books without Stripe", async () => {
    const v = await voucher(10000);
    const record = await bookWithVoucher({
      booking: { uid: "calHold1", status: "pending", start: inHours(100), end: inHours(103) },
      name: "Ada",
      email: "ada@example.com",
      packageId: "signature-studio",
      packageTitle: "Signature Studio Session",
      totalPrice: 165,
      voucherCode: v.code,
      voucherPence: 10000,
    });
    expect(h.cal.confirmCalBooking).toHaveBeenCalledWith("calHold1");
    expect(await getManualBooking(record.id)).toMatchObject({ via: "voucher", paidUpfront: 100, voucherCode: v.code });
    expect((await vouchers.getVoucher(v.code))?.balancePence).toBe(0);
    expect(h.email.sendBookingNotification).toHaveBeenCalledWith(expect.objectContaining({ voucherCode: v.code, balanceDue: "65.00" }));
  });

  it("gives the voucher back if Cal.com won't confirm", async () => {
    const v = await voucher(10000);
    h.cal.confirmCalBooking.mockResolvedValue(false);
    await expect(
      bookWithVoucher({
        booking: { uid: "calHold2", status: "pending", start: inHours(100), end: inHours(103) },
        name: "Ada",
        email: "ada@example.com",
        packageId: "signature-studio",
        packageTitle: "Signature Studio Session",
        totalPrice: 165,
        voucherCode: v.code,
        voucherPence: 8250,
      })
    ).rejects.toBeInstanceOf(VoucherBookingError);
    expect((await vouchers.getVoucher(v.code))?.balancePence).toBe(10000);
  });

  it("buying one creates exactly one voucher and emails it", async () => {
    const session = {
      id: "cs_test_gift",
      mode: "payment",
      payment_status: "paid",
      amount_total: 5000,
      metadata: { kind: "voucher", amount: "50", buyerName: "Bea", buyerEmail: "bea@example.com", recipientEmail: "cy@example.com" },
    };
    expect(await finalizePaidSession(session as never)).toMatchObject({ status: "done", kind: "voucher" });
    expect(await finalizePaidSession(session as never)).toMatchObject({ alreadyDone: true });
    expect(await vouchers.listVouchers()).toHaveLength(1);
    expect(h.email.sendVoucherEmails).toHaveBeenCalledTimes(1);
    expect(h.email.sendVoucherEmails).toHaveBeenCalledWith(expect.objectContaining({ amount: "50.00", recipientEmail: "cy@example.com" }));
  });

  it("refunding a part-voucher booking puts the voucher part back on the code", async () => {
    const v = await voucher(5000);
    const session = {
      id: "cs_test_pv",
      mode: "payment",
      payment_status: "paid",
      amount_total: 3250,
      payment_intent: "pi_pv",
      metadata: { customerName: "Ada", customerEmail: "ada@example.com", calBookingUid: "calPV", voucherCode: v.code, voucherPence: "5000" },
    };
    h.sessions = [session];
    await finalizePaidSession(session as never);
    expect((await vouchers.getVoucher(v.code))?.balancePence).toBe(0);
    expect(await actions.refundBooking("cs_test_pv", "deposit")).toMatch(/back on voucher/);
    expect((await vouchers.getVoucher(v.code))?.balancePence).toBe(5000);
  });

  it("a part-voucher card booking takes the voucher amount once, when paid", async () => {
    const v = await voucher(5000);
    const session = {
      id: "cs_test_partial",
      mode: "payment",
      payment_status: "paid",
      amount_total: 3250,
      metadata: { customerName: "Ada", customerEmail: "ada@example.com", calBookingUid: "calX", voucherCode: v.code, voucherPence: "5000" },
    };
    await finalizePaidSession(session as never);
    expect((await vouchers.getVoucher(v.code))?.balancePence).toBe(0);
  });
});

describe("Extra charges", () => {
  const deposit = {
    id: "cs_test_dep",
    mode: "payment",
    payment_status: "paid",
    metadata: { customerName: "Ada", customerEmail: "ada@example.com", calBookingUid: "calD", balanceDue: "15.00", packageTitle: "Studio Hire" },
  };

  it("emails a pay link, and the link opens Stripe for exactly that amount", async () => {
    h.sessions = [deposit];
    expect(await actions.chargeExtraOnBooking("cs_test_dep", { amount: 25, reason: "Overtime" })).toMatch(/sent to ada@example.com/);
    const { payUrl } = h.email.sendExtraChargeEmail.mock.calls[0][0];
    const token = payUrl.split("/").pop();
    expect(await extras.createExtraCheckout(token)).toMatchObject({ kind: "redirect" });
    expect(h.checkoutCreate.mock.calls[0][0]).toMatchObject({
      line_items: [expect.objectContaining({ price_data: expect.objectContaining({ unit_amount: 2500 }) })],
      metadata: expect.objectContaining({ kind: "extra", depositSessionId: "cs_test_dep" }),
    });
  });

  it("once paid, the link says so and the studio is told", async () => {
    h.sessions = [deposit];
    await actions.chargeExtraOnBooking("cs_test_dep", { amount: 25, reason: "Overtime" });
    const [extra] = (await extras.listExtras(["cs_test_dep"]))["cs_test_dep"];
    await finalizePaidSession({ id: "cs_test_x", mode: "payment", payment_status: "paid", amount_total: 2500, metadata: { kind: "extra", extraId: extra.id } } as never);
    expect(h.email.sendExtraPaidNotification).toHaveBeenCalledWith(expect.objectContaining({ amount: "25.00", reason: "Overtime" }));
    expect(await extras.createExtraCheckout(extra.token!)).toEqual({ kind: "already_paid" });
  });

  it("can be recorded as paid in person, with no email", async () => {
    h.sessions = [deposit];
    await actions.chargeExtraOnBooking("cs_test_dep", { amount: 10, reason: "Extra backdrop", paidInPerson: true });
    expect(h.email.sendExtraChargeEmail).not.toHaveBeenCalled();
    expect((await extras.listExtras(["cs_test_dep"]))["cs_test_dep"][0]).toMatchObject({ paidVia: "in-person" });
  });
});

describe("Moving bookings", () => {
  it("follows a booking through several moves", async () => {
    await recordMove("a", { newUid: "b", start: inHours(10), end: inHours(12), by: "studio" });
    await recordMove("b", { newUid: "c", start: inHours(30), end: inHours(32), by: "customer" });
    expect(await resolveCalUid("a")).toMatchObject({ uid: "c", move: expect.objectContaining({ newUid: "c" }) });
  });

  it("the balance link follows the new date, not the one Stripe still has", async () => {
    const session = {
      id: "cs_test_moved",
      mode: "payment",
      payment_status: "paid",
      metadata: { customerName: "Ada", customerEmail: "ada@example.com", calBookingUid: "calOld", balanceDue: "15.00", sessionStart: inHours(500) },
    };
    h.cal.getCalBooking.mockImplementation(async (uid: string) => ({ uid, status: "accepted", start: uid === "calNew" ? inHours(40) : inHours(500) }));
    expect(await sendBalanceLinkIfDue(session as never)).toBe(false);
    await recordMove("calOld", { newUid: "calNew", start: inHours(40), end: inHours(42), by: "customer" });
    expect(await sendBalanceLinkIfDue(session as never)).toBe(true);
  });

  it("the studio's move updates Cal.com, records it and emails the customer", async () => {
    h.sessions = [{ id: "cs_test_mv", mode: "payment", payment_status: "paid", metadata: { customerName: "Ada", customerEmail: "ada@example.com", calBookingUid: "calA", selectedPackage: "signature-studio" } }];
    h.cal.rescheduleCalBooking.mockResolvedValue({ uid: "calB", status: "accepted", start: inHours(300), end: inHours(303) });
    expect(await actions.moveBooking("cs_test_mv", inHours(300))).toMatch(/customer has been emailed/);
    expect(h.cal.rescheduleCalBooking).toHaveBeenCalledWith("calA", expect.any(String), expect.any(String));
    expect((await resolveCalUid("calA")).uid).toBe("calB");
    expect(h.email.sendBookingMovedEmail).toHaveBeenCalledWith(expect.objectContaining({ email: "ada@example.com" }));
  });
});

describe("No-shows", () => {
  it("flags the customer on their next booking email, only once the session has started", async () => {
    h.sessions = [{ id: "cs_test_ns", mode: "payment", payment_status: "paid", metadata: { customerName: "Ada", customerEmail: "ada@example.com", calBookingUid: "calN" } }];
    h.cal.getCalBooking.mockResolvedValue({ uid: "calN", status: "accepted", start: inHours(20) });
    await expect(actions.setNoShow("cs_test_ns", true)).rejects.toThrow(/once the session has started/);
    h.cal.getCalBooking.mockResolvedValue({ uid: "calN", status: "accepted", start: inHours(-20) });
    await actions.setNoShow("cs_test_ns", true);
    expect(await studioWarningFor("ADA@example.com")).toMatch(/didn't show up/);
    await actions.setNoShow("cs_test_ns", false);
    expect(await studioWarningFor("ada@example.com")).toBeUndefined();
  });
});

describe("Alerts and the activity log", () => {
  it("emails the first problem of a kind each hour and counts the rest", async () => {
    process.env.ALERT_EMAIL = "dev@example.com";
    await alert("daily-job", "first");
    await alert("daily-job", "second");
    await alert("stripe-webhook", "other kind");
    expect(h.email.sendAlertEmail).toHaveBeenCalledTimes(2);
    expect(await listAlerts()).toHaveLength(3);
  });

  it("records what the studio did", async () => {
    h.sessions = [{ id: "cs_test_c", mode: "payment", payment_status: "paid", metadata: { customerName: "Ada", calBookingUid: "calC", bookingDate: "Fri" } }];
    await actions.cancelBooking("cs_test_c");
    expect((await listActivity())[0]).toMatchObject({ action: "booking.cancel", ref: "cs_test_c" });
  });
});

describe("Blocking out time", () => {
  it("books the studio's own time in Cal.com and can reopen it", async () => {
    h.cal.createCalBooking.mockResolvedValue({ uid: "calBlock", status: "pending", start: inHours(50), end: inHours(59) });
    const block = await createBlock({ start: inHours(50), hours: 9, reason: "Private shoot" });
    expect(h.cal.createCalBooking).toHaveBeenCalledWith(expect.objectContaining({ lengthInMinutes: 540, name: "Studio closed: Private shoot" }));
    expect(h.cal.confirmCalBooking).toHaveBeenCalledWith("calBlock");
    expect(await listBlocks(new Date(), new Date(Date.now() + 7 * 86400_000))).toHaveLength(1);
    await removeBlock(block.id);
    expect(h.cal.cancelCalBooking).toHaveBeenCalledWith("calBlock", expect.any(String));
    expect(await listBlocks(new Date(), new Date(Date.now() + 7 * 86400_000))).toHaveLength(0);
  });

  it("only takes 2 to 9 hours", async () => {
    await expect(createBlock({ start: inHours(50), hours: 1, reason: "" })).rejects.toThrow(/2 to 9 hours/);
  });
});

describe("Memberships", () => {
  it("cancelling inside the 3-month minimum ends it when the minimum is up", async () => {
    const start = Math.floor(Date.now() / 1000) - 20 * 86400;
    h.subRetrieve.mockResolvedValue({ id: "sub_1", status: "active", start_date: start, metadata: { tierId: "signature" }, items: { data: [{ current_period_end: start + 30 * 86400 }] } });
    expect(await cancelMember("sub_1")).toMatch(/3-month minimum/);
    const cancelAt = h.subUpdate.mock.calls[0][1].cancel_at;
    expect(cancelAt).toBeGreaterThan(start + 85 * 86400);
  });
});

describe("Payments report", () => {
  it("uses UK month boundaries, summer and winter", () => {
    expect(monthRange("2026-07").from.toISOString()).toBe("2026-06-30T23:00:00.000Z");
    expect(monthRange("2026-12").from.toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(monthRange("2026-12").to.toISOString()).toBe("2027-01-01T00:00:00.000Z");
    expect(() => monthRange("2026-13")).toThrow();
  });
});
