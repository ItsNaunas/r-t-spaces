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
            Your deposit has been received and your studio time is confirmed. We&apos;ve emailed
            you the details.
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
              <li>Check your email for the booking confirmation and calendar invite</li>
              <li>Your slot is held in our diary, so there is nothing else to confirm</li>
              <li>We&apos;ll send a reminder before your session</li>
              <li>The remaining balance is due before your session starts</li>
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

