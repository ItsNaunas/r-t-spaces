import { SiteFooter } from "@/components/StudioSections";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { BookingSuccessMessage } from "@/components/BookingSuccessMessage";
import { GradientBars } from "@/components/ui/gradient-bars";

const bookingPolicies = [
  {
    title: "Booking Confirmation",
    content:
      "We'll confirm your booking within 24 hours via email. For last-minute bookings (within 48 hours), please DM us on Instagram @rtspaces.",
  },
  {
    title: "Cancellation Policy",
    content:
      "The 50% deposit is non-refundable. If you cancel 48 hours or more before your session, any balance you've already paid is refunded in full. Cancellations within 48 hours are non-refundable.",
  },
  {
    title: "Rescheduling",
    content:
      "Rescheduling is free when requested 48 hours or more before your booking. Changes within 48 hours may incur a rescheduling fee.",
  },
  {
    title: "Payment",
    content:
      "A 50% non-refundable deposit is required to secure your booking. The remaining balance is due 48 hours before your session date.",
  },
  {
    title: "Studio Hours",
    content:
      "Our studio is open daily from 8 AM to 11 PM. Extended hours may be available upon request.",
  },
  {
    title: "Equipment & Setup",
    content:
      "All listed equipment is included in your booking. Let us know your specific requirements when booking, and we'll have everything ready before your call time.",
  },
];

const availabilityInfo = {
  title: "Check Availability",
  description:
    "Our studio is available daily from 8 AM to 11 PM. Popular time slots book quickly, so we recommend booking at least 1-2 weeks in advance.",
  currentStatus: "Open for bookings",
  popularTimes: [
    "Weekday mornings (8 AM - 12 PM)",
    "Weekday afternoons (2 PM - 6 PM)",
    "Weekend slots (all day)",
  ],
};

export default function BookOnlinePage({
  searchParams,
}: {
  searchParams?: { success?: string; cancelled?: string; session_id?: string };
}) {
  return (
    <div className="bg-[var(--base)]">
      {/* Hero band */}
      <section
        className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20"
        style={{ backgroundColor: "var(--hero-background)" }}
      >
        <GradientBars colors={["var(--primary)", "transparent"]} />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.4em] text-[var(--primary)]/80">
              Book Online
            </p>
            <h1 className="font-heading text-4xl leading-tight text-[var(--primary)] sm:text-5xl lg:text-6xl">
              Reserve your studio time
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[var(--primary)]/90">
              Choose your option, pick a time, and pay your deposit in a few taps.
              We&apos;ll confirm everything by email.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        {/* Success Message */}
        {searchParams?.success === "true" && (
          <BookingSuccessMessage />
        )}

        {/* Cancel Message */}
        {searchParams?.cancelled === "true" && (
          <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-6 text-[var(--primary)]">
            <p className="font-semibold">Booking Cancelled</p>
            <p className="text-sm mt-2">
              Your booking was not completed. You can try again or contact us directly.
            </p>
          </div>
        )}

        {/* Availability Section */}
        <section className="border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6 lg:p-8 rounded-2xl">
          <h2 className="font-heading text-2xl text-[var(--primary)] mb-4">
            {availabilityInfo.title}
          </h2>
          <p className="text-[var(--muted-plum)] mb-6">
            {availabilityInfo.description}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)] mb-2">
                Current Status
              </p>
              <p className="text-lg font-semibold text-[var(--primary)]">
                {availabilityInfo.currentStatus}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)] mb-2">
                Popular Time Slots
              </p>
              <ul className="space-y-1 text-[var(--muted-plum)]">
                {availabilityInfo.popularTimes.map((time, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg
                      className="h-4 w-4 text-[var(--primary)] mt-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Booking Wizard */}
        <section className="space-y-8">
          <div className="h-[80vh] min-h-[640px] overflow-hidden rounded-2xl border-2 border-[var(--primary)]/30 bg-white shadow-lg">
            <BookingWizard />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Contact */}
            <div className="border border-[var(--accent)]/20 p-6 space-y-4 rounded-2xl">
              <h3 className="font-heading text-xl text-[var(--primary)]">
                Need Immediate Assistance?
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
                    Phone
                  </p>
                  <a
                    href="tel:07944667000"
                    className="text-base text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
                  >
                    07944667000
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
                    Email
                  </p>
                  <a
                    href="mailto:enquires@rtspaces.co.uk"
                    className="text-base text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
                  >
                    enquires@rtspaces.co.uk
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
                    Instagram
                  </p>
                  <a
                    href="https://www.instagram.com/rtspaces/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
                  >
                    @rtspaces
                  </a>
                </div>
              </div>
            </div>

            {/* Studio Hours */}
            <div className="border border-[var(--accent)]/20 p-6 rounded-2xl">
              <h3 className="font-heading text-xl text-[var(--primary)] mb-4">
                Studio Hours
              </h3>
              <div className="space-y-2 text-[var(--muted-plum)]">
                <p className="flex justify-between">
                  <span>Monday - Sunday</span>
                  <span className="font-semibold">8 AM - 11 PM</span>
                </p>
                <p className="text-sm text-[var(--muted-plum)]">
                  Extended hours available upon request
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Policies Section */}
        <section className="space-y-6 border-t border-[var(--accent)]/20 pt-12">
          <div>
            <h2 className="font-heading text-3xl text-[var(--primary)] mb-4">
              Booking Policies
            </h2>
            <p className="text-[var(--muted-plum)]">
              Please review our booking policies before submitting your request.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookingPolicies.map((policy) => (
              <article
                key={policy.title}
                className="border border-[var(--accent)]/20 p-6 space-y-3 rounded-2xl"
              >
                <h3 className="font-heading text-xl text-[var(--primary)]">
                  {policy.title}
                </h3>
                <p className="text-sm text-[var(--muted-plum)] leading-relaxed">
                  {policy.content}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-6 border-t border-[var(--accent)]/20 pt-12">
          <h2 className="font-heading text-3xl text-[var(--primary)]">
            Ready to Book?
          </h2>
          <p className="text-lg text-[var(--muted-plum)] max-w-2xl mx-auto">
            Fill out the booking form above or contact us directly for
            immediate assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:07944667000"
              className="btn-primary"
            >
              Call Now
            </a>
            <a
              href="https://www.instagram.com/rtspaces/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              DM on Instagram
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}


