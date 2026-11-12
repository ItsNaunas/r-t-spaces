"use client";

import { useSearchParams } from 'next/navigation';
import type { CheckoutOutcome } from '@/lib/checkoutOutcome';

/** Copy per outcome. Only "confirmed" promises the slot is secured. */
const COPY: Record<CheckoutOutcome, { title: string; body: string; next: string[] }> = {
  confirmed: {
    title: 'Payment Successful!',
    body: "Your deposit has been received and your studio time is confirmed. We've emailed you the details.",
    next: [
      'Check your email for the booking confirmation and calendar invite',
      'Your slot is held in our diary, so there is nothing else to confirm',
      "We'll send a reminder before your session",
      'The remaining balance is due before your session starts',
    ],
  },
  unconfirmed: {
    title: 'Deposit Received',
    body: "Your deposit has been received. We're confirming your time now and will be in touch shortly.",
    next: [
      "The studio has been notified and will confirm your time",
      'Keep your booking reference below in case you need to contact us',
      'The remaining balance is due before your session starts',
    ],
  },
  balance_paid: {
    title: "You're all paid up!",
    body: "Thanks, your remaining balance has been received and your booking is now paid in full. We've emailed you a receipt.",
    next: ['Nothing else to pay', 'We look forward to seeing you at the studio'],
  },
  extra_paid: {
    title: 'Payment received',
    body: "Thanks, your payment has been received. We've emailed you a receipt.",
    next: ['Nothing else to pay for this charge'],
  },
  voucher_bought: {
    title: 'Your gift voucher is on its way',
    body: "Thanks for your purchase! We've emailed the voucher code, and sent it to the recipient if you gave us their email.",
    next: [
      'The code works in the discount box when booking',
      "Any value left over after a booking stays on the code",
      'Vouchers are valid for 12 months',
    ],
  },
  processing: {
    title: 'Thanks! We are checking your payment',
    body: "We're finalising your booking. You'll get a confirmation email as soon as it's done.",
    next: [
      "If you don't hear from us within the hour, contact us with your booking reference below",
    ],
  },
};

export function BookingSuccessMessage({ outcome = 'confirmed' }: { outcome?: CheckoutOutcome }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const copy = COPY[outcome];

  return (
    <div className="border-2 border-emerald-500/20 bg-emerald-500/10 p-6 rounded-sm space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-2xl text-emerald-800 mb-2">
            {copy.title}
          </h2>
          <p className="text-emerald-700 mb-4">
            {copy.body}
          </p>

          {sessionId && (
            <div className="mt-4 p-3 bg-white/50 rounded border border-emerald-200">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 mb-1">
                Booking Reference
              </p>
              <p className="font-mono text-sm text-emerald-800 break-all">
                {sessionId}
              </p>
            </div>
          )}

          <div className="mt-4 text-sm text-emerald-700">
            <p className="font-semibold mb-2">What&apos;s next?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              {copy.next.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-200">
            <p className="text-sm text-emerald-700/80">
              If you have any questions, contact us at{" "}
              <a
                href="mailto:enquires@rtspaces.co.uk"
                className="font-semibold text-emerald-800 hover:underline"
              >
                enquires@rtspaces.co.uk
              </a>{" "}
              or call{" "}
              <a
                href="tel:07944667000"
                className="font-semibold text-emerald-800 hover:underline"
              >
                07944667000
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
