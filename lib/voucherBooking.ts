import { confirmCalBooking, type CalBooking } from "./calcom";
import { confirmPendingBooking } from "./pendingBookings";
import { newManualId, saveManualBooking, type ManualBooking } from "./manualBookings";
import { restoreVoucher, spendVoucher } from "./vouchers";
import { sendBalanceLinkIfDue, subjectFromManual } from "./balance";
import { sendBookingNotification } from "./email";
import { studioWarningFor } from "./customerNotes";
import { alert } from "./alerts";
import { displayTimes } from "./calMoves";

/**
 * A booking whose deposit a gift voucher covers in full. Stripe can't take a
 * £0 payment, so this is confirmed here instead of by the Stripe webhook:
 * the voucher is charged first, then the Cal.com hold is confirmed, then it
 * is recorded like a manual booking (via "voucher"). If Cal.com won't
 * confirm, the voucher is given back and nothing is booked.
 */
export type VoucherBookingInput = {
  booking: CalBooking;
  pendingBookingId?: string;
  name: string;
  email: string;
  packageId: string;
  packageTitle: string;
  totalPrice: number;
  voucherCode: string;
  /** Pence the voucher pays (deposit and possibly some of the balance). */
  voucherPence: number;
  notes?: string;
  source?: string;
};

export class VoucherBookingError extends Error {}

export async function bookWithVoucher(input: VoucherBookingInput): Promise<ManualBooking> {
  const ref = `hold:${input.booking.uid}`;
  const taken = await spendVoucher(input.voucherCode, input.voucherPence, ref);
  if (taken !== input.voucherPence) {
    await restoreVoucher(input.voucherCode, ref);
    throw new VoucherBookingError("Your voucher balance changed. Please apply it again.");
  }

  if (!(await confirmCalBooking(input.booking.uid))) {
    await restoreVoucher(input.voucherCode, ref);
    await alert("voucher-booking", "Cal.com wouldn't confirm a voucher booking; the voucher was given back", {
      uid: input.booking.uid,
    });
    throw new VoucherBookingError("We couldn't confirm that time. Your voucher hasn't been charged. Please try again.");
  }
  if (input.pendingBookingId) await confirmPendingBooking(input.pendingBookingId).catch(() => false);

  const paid = input.voucherPence / 100;
  const record: ManualBooking = {
    id: newManualId(),
    calBookingUid: input.booking.uid,
    name: input.name,
    email: input.email,
    phone: "",
    notes: input.notes ?? "",
    packageId: input.packageId,
    packageTitle: input.packageTitle,
    start: input.booking.start,
    end: input.booking.end,
    ...displayTimes(input.booking.start, input.booking.end),
    totalPrice: input.totalPrice,
    paidUpfront: paid,
    emailCustomer: true,
    createdAt: new Date().toISOString(),
    ...(paid >= input.totalPrice ? { paidInFullAt: new Date().toISOString() } : {}),
    via: "voucher",
    voucherCode: input.voucherCode,
    source: input.source,
  };
  await saveManualBooking(record);

  const owed = Math.max(0, input.totalPrice - paid);
  try {
    await sendBookingNotification({
      name: record.name,
      email: record.email,
      date: record.bookingDate,
      hours: record.bookingHours,
      notes: record.notes || undefined,
      paid: true,
      calConfirmed: true,
      calBookingUids: [record.calBookingUid],
      packageTitle: record.packageTitle,
      totalPrice: input.totalPrice.toFixed(2),
      depositAmount: paid.toFixed(2),
      balanceDue: owed.toFixed(2),
      voucherCode: input.voucherCode,
      voucherAmount: paid.toFixed(2),
      studioWarning: await studioWarningFor(record.email),
    });
    const subject = subjectFromManual(record);
    if (subject) await sendBalanceLinkIfDue(subject);
  } catch (error) {
    await alert("voucher-booking", "Voucher booking saved, but its emails failed", error);
  }
  return record;
}
