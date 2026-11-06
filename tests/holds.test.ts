import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeRedis, type FakeRedis } from "./fakeRedis";

const h = vi.hoisted(() => ({
  redis: null as unknown as FakeRedis,
  cancelCalBooking: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({ getRedis: () => h.redis }));
vi.mock("@/lib/calcom", () => ({ cancelCalBooking: h.cancelCalBooking }));

import * as pending from "@/lib/pendingBookings";

async function seedHold() {
  return pending.savePendingBooking({
    id: "p1",
    calBookingUid: "calUid123",
    customerName: "Ada",
    customerEmail: "ada@example.com",
    startTime: "2026-11-06T10:00:00Z",
    endTime: "2026-11-06T14:00:00Z",
  });
}

beforeEach(() => {
  h.redis = createFakeRedis();
  vi.clearAllMocks();
  h.cancelCalBooking.mockResolvedValue(true);
});

describe("Releasing a hold the customer abandoned (finding #8)", () => {
  it("releases a hold that never reached checkout", async () => {
    await seedHold();
    expect(await pending.releaseUnpaidHold("calUid123")).toBe(true);
    expect(h.cancelCalBooking).toHaveBeenCalledWith("calUid123", expect.any(String));
  });

  it("refuses to release a hold that has a Stripe checkout attached", async () => {
    await seedHold();
    await pending.updatePendingBookingStripeSession("p1", "cs_test_abc");
    expect(await pending.releaseUnpaidHold("calUid123")).toBe(false);
    expect(h.cancelCalBooking).not.toHaveBeenCalled();
  });

  it("refuses to release a hold that is already paid", async () => {
    await seedHold();
    await pending.confirmPendingBooking("p1", "cs_test_abc");
    expect(await pending.releaseUnpaidHold("calUid123")).toBe(false);
    expect(h.cancelCalBooking).not.toHaveBeenCalled();
  });
});

describe("Hold window vs checkout window", () => {
  it("starting checkout restarts the hold so the sweep can't release a payable slot", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-06T10:00:00Z"));
    await seedHold();

    // The customer spends 20 minutes on add-ons before paying.
    vi.setSystemTime(new Date("2026-11-06T10:20:00Z"));
    await pending.updatePendingBookingStripeSession("p1", "cs_test_abc");

    // 30 minutes into checkout (inside Stripe's 31-minute window) the sweep runs.
    vi.setSystemTime(new Date("2026-11-06T10:50:00Z"));
    expect(await pending.cancelExpiredPendingBookings()).toBe(0);
    expect(h.cancelCalBooking).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
