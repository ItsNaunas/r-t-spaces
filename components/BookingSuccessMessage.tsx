"use client";

import { useSearchParams } from 'next/navigation';

export function BookingSuccessMessage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

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
            Payment Successful!
          </h2>
          <p className="text-emerald-700 mb-4">
            Your booking deposit has been processed successfully. We'll send you a confirmation email shortly with your booking details and a link to confirm your exact time slot.
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
            <p className="font-semibold mb-2">What's next?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check your email for booking confirmation</li>
              <li>Click the Calendly link in your email to confirm your exact time slot</li>
              <li>We'll send a reminder 48 hours before your booking</li>
              <li>The remaining balance will be due 48 hours before your booking</li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-200">
            <p className="text-sm text-emerald-700/80">
              If you have any questions, contact us at{" "}
              <a
                href="mailto:Teddy77723@gmail.com"
                className="font-semibold text-emerald-800 hover:underline"
              >
                Teddy77723@gmail.com
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

