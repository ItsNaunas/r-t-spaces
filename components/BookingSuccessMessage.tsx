"use client";

export function BookingSuccessMessage() {
  return (
    <div className="border border-emerald-500/20 bg-emerald-500/10 p-6 space-y-3 rounded-lg">
      <div className="flex items-start gap-3">
        <svg
          className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <h3 className="font-heading text-xl text-emerald-600 mb-2">
            Booking Confirmed!
          </h3>
          <p className="text-emerald-700/90 mb-3">
            Your payment was successful and your booking has been confirmed. 
            You should receive:
          </p>
          <ul className="space-y-2 text-sm text-emerald-700/80">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>Email confirmation with booking details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>Calendar invitation added to your email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">✓</span>
              <span>Booking automatically added to our calendar</span>
            </li>
          </ul>
          <p className="text-sm text-emerald-700/70 mt-4">
            If you have any questions, contact us at{" "}
            <a
              href="mailto:Teddy77723@gmail.com"
              className="font-semibold hover:underline"
            >
              Teddy77723@gmail.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:07944667000"
              className="font-semibold hover:underline"
            >
              07944667000
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

