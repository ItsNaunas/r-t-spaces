import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeRedis, type FakeRedis } from "./fakeRedis";

const h = vi.hoisted(() => ({
  redis: null as unknown as FakeRedis,
  getCalBooking: vi.fn(),
  cancelCalBooking: vi.fn(),
  sendAbandonedBookingEmail: vi.fn(),
  sendReviewRequestEmail: vi.fn(),
  sessions: [] as Record<string, unknown>[],
  listByEmail: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({ getRedis: () => h.redis }));
vi.mock("@/lib/calcom", () => ({ getCalBooking: h.getCalBooking, cancelCalBooking: h.cancelCalBooking }));
vi.mock("@/lib/email", () => ({
  sendAbandonedBookingEmail: h.sendAbandonedBookingEmail,
  sendReviewRequestEmail: h.sendReviewRequestEmail,
  sendBalanceLinkEmail: vi.fn(),
  sendBalancePaidNotification: vi.fn(),
}));
vi.mock("stripe", () => ({
  default: class {
    checkout = {
      sessions: {
        list: (params: { customer_details?: { email: string } }) => {
          if (params.customer_details) return h.listByEmail(params);
          return { autoPagingToArray: async () => h.sessions };
        },
      },
    };
  },
}));

import { sendAbandonedFollowUps, sendReviewRequests } from "@/lib/followUps";
import { savePendingBooking, cancelPendingBooking, releaseUnpaidHold } from "@/lib/pendingBookings";

process.env.STRIPE_SECRET_KEY = "sk_test_fake";

const NOW = new Date("2026-11-12T08:00:00Z");

async function hold(id: string, email = "sarah@example.com") {
  return savePendingBooking({
    id,
    calBookingUid: `cal_${id}`,
    customerName: "Sarah",
    customerEmail: email,
    startTime: "2026-11-14T13:00:00Z",
    endTime: "2026-11-14T15:00:00Z",
    bookingData: { packageTitle: "Essential Studio Session" },
  } as never);
}

beforeEach(() => {
  h.redis = createFakeRedis();
  vi.clearAllMocks();
  h.sessions = [];
  h.cancelCalBooking.mockResolvedValue(true);
  h.listByEmail.mockResolvedValue({ data: [] });
  h.sendAbandonedBookingEmail.mockResolvedValue(undefined);
  h.sendReviewRequestEmail.mockResolvedValue(undefined);
});

describe("Still want to book?", () => {
  it("emails someone whose checkout expired unpaid, once", async () => {
    await hold("pending_1");
    await cancelPendingBooking("pending_1", "Checkout expired without payment");

    expect(await sendAbandonedFollowUps(new Date())).toMatchObject({ sent: 1 });
    expect(h.sendAbandonedBookingEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "sarah@example.com", packageTitle: "Essential Studio Session" })
    );
    expect(await sendAbandonedFollowUps(new Date())).toMatchObject({ sent: 0 });
  });

  it("doesn't email people who changed package, or whose booking the studio cancelled", async () => {
    await hold("pending_2");
    await releaseUnpaidHold("cal_pending_2");
    await hold("pending_3");
    await cancelPendingBooking("pending_3", "Cancelled in Cal.com");
    expect(await sendAbandonedFollowUps(new Date())).toMatchObject({ checked: 0, sent: 0 });
  });

  it("doesn't email someone who went on to book and pay", async () => {
    await hold("pending_4");
    await cancelPendingBooking("pending_4", "Checkout expired without payment");
    h.listByEmail.mockResolvedValue({ data: [{ payment_status: "paid" }] });
    expect(await sendAbandonedFollowUps(new Date())).toMatchObject({ sent: 0, skipped: 1 });
    expect(h.sendAbandonedBookingEmail).not.toHaveBeenCalled();
  });

  it("sends at most one per person, however many times they try", async () => {
    await hold("pending_5");
    await cancelPendingBooking("pending_5", "Payment failed");
    await hold("pending_6");
    await cancelPendingBooking("pending_6", "Checkout expired without payment");
    expect(await sendAbandonedFollowUps(new Date())).toMatchObject({ sent: 1, skipped: 1 });
  });
});

describe("Review requests", () => {
  const deposit = (id: string, start: string) => ({
    id,
    mode: "payment",
    payment_status: "paid",
    metadata: { customerName: "Ada", customerEmail: `${id}@example.com`, calBookingUid: `cal_${id}`, sessionStart: start },
  });

  beforeEach(() => {
    process.env.GOOGLE_REVIEW_URL = "https://g.page/r/example/review";
    h.getCalBooking.mockImplementation(async (uid: string) => ({ uid, status: "accepted" }));
  });

  it("asks the day after the session, once", async () => {
    h.sessions = [
      deposit("yesterday", "2026-11-11T13:00:00Z"),
      deposit("today", "2026-11-12T13:00:00Z"),
      deposit("lastweek", "2026-11-04T13:00:00Z"),
    ];
    expect(await sendReviewRequests(NOW)).toMatchObject({ sent: 1 });
    expect(h.sendReviewRequestEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "yesterday@example.com", reviewUrl: "https://g.page/r/example/review" })
    );
    expect(await sendReviewRequests(NOW)).toMatchObject({ sent: 0 });
  });

  it("skips cancelled bookings", async () => {
    h.sessions = [deposit("refunded", "2026-11-11T13:00:00Z")];
    h.getCalBooking.mockResolvedValue({ uid: "x", status: "cancelled" });
    expect(await sendReviewRequests(NOW)).toMatchObject({ sent: 0 });
  });

  it("is off until the studio's review link is set", async () => {
    delete process.env.GOOGLE_REVIEW_URL;
    h.sessions = [deposit("yesterday", "2026-11-11T13:00:00Z")];
    expect(await sendReviewRequests(NOW)).toEqual({ skipped: "GOOGLE_REVIEW_URL is not set" });
    expect(h.sendReviewRequestEmail).not.toHaveBeenCalled();
  });
});
