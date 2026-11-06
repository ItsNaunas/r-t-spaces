import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: h.send };
    contacts = { create: vi.fn() };
  },
}));

import { sendBookingNotification } from "@/lib/email";

process.env.RESEND_API_KEY = "re_fake";
process.env.STUDIO_EMAIL = "studio@example.com";

const paidBooking = {
  name: "Ada",
  email: "ada@example.com",
  date: "Friday 6 November 2026",
  hours: "10:00 – 14:00",
  paid: true,
  totalPrice: "40.00",
  depositAmount: "20.00",
  balanceDue: "20.00",
};

beforeEach(() => {
  vi.clearAllMocks();
  h.send.mockResolvedValue({ data: { id: "email_1" }, error: null });
});

describe("Booking emails", () => {
  it("reports a Resend failure instead of claiming success (Resend returns errors, it doesn't throw)", async () => {
    h.send.mockImplementation(async (msg: { to: string }) =>
      msg.to === "studio@example.com"
        ? { data: null, error: { name: "validation_error", message: "domain not verified" } }
        : { data: { id: "email_2" }, error: null }
    );
    await expect(sendBookingNotification(paidBooking)).rejects.toThrow(/domain not verified/);
  });

  it("still emails the customer when the studio email fails", async () => {
    h.send.mockImplementation(async (msg: { to: string }) => {
      if (msg.to === "studio@example.com") throw new Error("network down");
      return { data: { id: "email_2" }, error: null };
    });
    await sendBookingNotification(paidBooking).catch(() => {});
    expect(h.send).toHaveBeenCalledWith(expect.objectContaining({ to: "ada@example.com" }));
  });

  it("flags a paid-but-unconfirmed booking to the studio (finding #7)", async () => {
    await sendBookingNotification({ ...paidBooking, calConfirmed: false, calBookingUids: ["calUid123"] });
    const studio = h.send.mock.calls.map((c) => c[0]).find((m) => m.to === "studio@example.com");
    expect(studio.subject).toMatch(/^ACTION NEEDED/);
    expect(studio.html).toContain("calUid123");
    const customer = h.send.mock.calls.map((c) => c[0]).find((m) => m.to === "ada@example.com");
    expect(customer.subject).toBe("Deposit Received - RT Spaces");
  });

  it("lets the studio reply straight to the customer", async () => {
    await sendBookingNotification(paidBooking);
    const studio = h.send.mock.calls.map((c) => c[0]).find((m) => m.to === "studio@example.com");
    expect(studio.replyTo).toBe("ada@example.com");
  });
});
