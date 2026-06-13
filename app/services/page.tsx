"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/StudioSections";
import { BookNowButton } from "@/components/booking/BookNowButton";
import { studioServices } from "@/lib/studioData";
import { GradientBars } from "@/components/ui/gradient-bars";
import { BOOKING_PACKAGES, ADDONS, HIRE_RATE_IDS, type BookingPackage } from "@/lib/pricing";

const MAIN_PACKAGE_IDS = ["essential-studio", "signature-studio", "luxury-studio", "engagement-story"];

const mainPackages = BOOKING_PACKAGES.filter((p) => MAIN_PACKAGE_IDS.includes(p.id));
const hirePackages = BOOKING_PACKAGES.filter((p) => HIRE_RATE_IDS.includes(p.id));

function PackageCard({ pkg }: { pkg: BookingPackage }) {
  return (
    <article
      className={`relative flex flex-col border-2 shadow-md transition-all duration-300 ${
        pkg.popular
          ? "border-[var(--primary)] shadow-lg scale-105 md:scale-110"
          : "border-[var(--accent)]/20 hover:border-[var(--primary)] hover:shadow-md"
      } bg-white`}
    >
      {pkg.limitedOffer && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[var(--primary)] text-white px-4 py-1 text-xs font-semibold uppercase tracking-wider">
            Limited offer
          </span>
        </div>
      )}

      <div className="p-8 flex flex-col flex-grow">
        <div className="mb-6 pb-4 border-b border-[var(--accent)]/20">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-2">
            {pkg.duration}
          </p>
          <h3 className="font-heading text-2xl text-[var(--primary)] mb-4">
            {pkg.title}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-[var(--primary)]">
              £{pkg.price}
            </span>
          </div>
          {pkg.depositAmount != null && pkg.balanceOnDay != null && (
            <p className="text-sm text-[var(--muted-plum)] mt-2">
              £{pkg.depositAmount} non-refundable deposit to book. Remaining £{pkg.balanceOnDay} paid on the day.
            </p>
          )}
        </div>

        <ul className="space-y-4 mb-8 flex-grow">
          {pkg.includes.map((detail) => (
            <li key={detail} className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-base text-[var(--muted-plum)] leading-relaxed">
                {detail}
              </span>
            </li>
          ))}
        </ul>
        {pkg.bestFor && (
          <p className="text-sm text-[var(--muted-plum)] mb-4">
            <strong className="text-[var(--primary)]">Best for:</strong> {pkg.bestFor}
          </p>
        )}
        {pkg.availabilityNote && (
          <p className="text-xs text-[var(--muted-plum)] mb-4">
            {pkg.availabilityNote}
          </p>
        )}

        <Link
          href={`/?package=${encodeURIComponent(pkg.title)}#contact`}
          className={`mt-auto w-full text-center ${
            pkg.popular ? "btn-primary" : "btn-secondary"
          }`}
        >
          Book Now
        </Link>
      </div>
    </article>
  );
}

const PRICING_SECTIONS: { id: string; label: string; description: string; packages: BookingPackage[] }[] = [
  { id: "basic", label: "Studio hire", description: "By the hour or block. Just the space, no session package.", packages: hirePackages },
  { id: "package", label: "Session packages", description: "Time, images, and guidance included.", packages: mainPackages },
];

export default function ServicesPage() {

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-[var(--base)]">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden pt-20 pb-16"
        style={{ backgroundColor: 'var(--hero-background)' }}
      >
        <div className="absolute inset-0 w-full h-full">
          <GradientBars colors={['var(--primary)', 'transparent']} />
        </div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--primary)]/80">
                Packages / Pricing
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[var(--primary)] leading-tight">
                Simple Pricing for
                <br />
                Every Creative Need
              </h1>
              <p className="text-lg sm:text-xl text-[var(--primary)]/90 max-w-2xl mx-auto leading-relaxed">
                Studio sessions for every moment—portraits, couples, families, and
                special occasions. Choose your package and book with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => scrollToSection("packages")}
                  className="btn-primary group"
                >
                  <span className="flex items-center gap-2">
                    View Packages
                    <svg
                      className="w-5 h-5 transition-transform group-hover:translate-y-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>
                <BookNowButton className="inline-flex items-center justify-center border-2 border-white bg-white px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-medium text-[var(--primary)] transition-all duration-300 hover:bg-white/90 hover:border-white hover:scale-[1.02] hover:shadow-lg">
                  Book Now
                </BookNowButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="bg-white py-12 sm:py-16 border-b border-[var(--lavender)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center space-y-4 mb-10">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
              What&apos;s Included
            </p>
            <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl lg:text-5xl">
              Studio Support & Services
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-[var(--muted-plum)]">
              Every booking comes with professional support to ensure your session runs smoothly from start to finish.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {studioServices.map((service, index) => (
              <article
                key={service.title}
                className="border border-[var(--accent)]/20 bg-white overflow-hidden hover:border-[var(--primary)] transition-all duration-300 group"
              >
                {service.image && (
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.imageAlt ?? service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6 flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[var(--primary)] text-white flex items-center justify-center font-heading text-lg">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-heading text-xl text-[var(--primary)] mb-2 group-hover:underline">
                      {service.title}
                    </h3>
                    <p className="text-base text-[var(--muted-plum)] leading-relaxed">
                      {service.meta}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl space-y-16 px-4 pb-16 pt-12 sm:space-y-20 sm:px-6 lg:px-8">
        {/* Packages Section — all options visible */}
        <section id="packages" className="scroll-mt-24">
          <div className="text-center space-y-4 mb-12">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
              Choose Your Package
            </p>
            <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl lg:text-5xl">
              Flexible Booking Options
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-[var(--muted-plum)]">
              All packages include professional guidance and private online gallery where applicable.
            </p>
            <nav className="flex flex-wrap justify-center gap-4 pt-2" aria-label="Jump to pricing section">
              {PRICING_SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#pricing-${sec.id}`}
                  className="text-sm font-medium text-[var(--primary)] underline underline-offset-4 hover:text-[var(--primary)]/80 transition-colors"
                >
                  {sec.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="space-y-16">
            {PRICING_SECTIONS.map((sec) => {
              const gridCols = sec.packages.length <= 2 ? "md:grid-cols-2" : sec.packages.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4";
              return (
                <div key={sec.id} id={`pricing-${sec.id}`} className="scroll-mt-24">
                  <div className="mb-6">
                    <h3 className="font-heading text-2xl text-[var(--primary)] font-semibold">
                      {sec.label}
                    </h3>
                    <p className="text-[var(--muted-plum)] mt-1">
                      {sec.description}
                    </p>
                  </div>
                  <div className={`grid gap-8 ${gridCols} lg:gap-6`}>
                    {sec.packages.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Booking Terms */}
          <div className="mt-12 p-6 bg-[var(--accent)]/5 border border-[var(--accent)]/20 border-l-4 border-l-[var(--primary)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-[var(--primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <ul className="flex-grow space-y-2 text-base text-[var(--muted-plum)] list-disc list-inside">
                <li>A non-refundable deposit is required to secure your booking.</li>
                <li>Remaining balance is due on the day of your session.</li>
                <li>Special mini sessions are released for limited events only (Valentine&apos;s, Mother&apos;s Day, Christmas).</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Studio Services Section */}
        <section id="services" className="scroll-mt-24">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-4">
                  What&apos;s Included
                </p>
                <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl mb-6">
                  Studio Support & Services
                </h2>
                <p className="text-lg text-[var(--muted-plum)] leading-relaxed">
                  Every booking comes with professional support to ensure your session runs smoothly from start to finish.
                </p>
              </div>

              <div className="space-y-4">
                {studioServices.map((service, index) => (
                  <article
                    key={service.title}
                    className="border border-[var(--accent)]/20 bg-white p-6 hover:border-[var(--primary)] transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-[var(--primary)] text-white flex items-center justify-center font-heading text-lg">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-heading text-xl text-[var(--primary)] mb-2 group-hover:underline">
                          {service.title}
                        </h3>
                        <p className="text-base text-[var(--muted-plum)] leading-relaxed">
                          {service.meta}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-[var(--accent)]/20 bg-white p-8">
                <h3 className="font-heading text-2xl text-[var(--primary)] mb-6">
                  Why Choose RT Spaces?
                </h3>
                <ul className="space-y-4">
                  {[
                    "Professional-grade equipment included",
                    "East London location with easy access",
                    "Flexible booking hours (8 AM - 11 PM)",
                    "Expert crew support available",
                    "White cyclorama + styled corners",
                    "Pre-configured lighting setups",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-base text-[var(--muted-plum)]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/#contact"
                className="block w-full btn-secondary text-center"
              >
                Have Questions? Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* Add-ons Section */}
        <section id="addons" className="scroll-mt-24">
          <div className="text-center space-y-4 mb-12">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
              Enhance Your Session
            </p>
            <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl lg:text-5xl">
              Optional Add-ons
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-[var(--muted-plum)]">
              Add extra images, time, or people to your session. Ask about prints and albums when you book.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {ADDONS.map((addon) => (
              <div
                key={addon.id}
                className="border-2 border-[var(--accent)]/20 shadow-md bg-white p-6 hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                    <svg
                      className="h-6 w-6 text-[var(--primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-base text-[var(--muted-plum)] leading-relaxed">
                  {addon.label}
                  {addon.price != null ? (
                    <span className="font-semibold text-[var(--primary)] block mt-1">
                      {addon.unit === "person" ? `£${addon.price} per person` : addon.unit === "image" ? `£${addon.price} each` : `£${addon.price}`}
                    </span>
                  ) : (
                    <span className="text-[var(--muted-plum)] block mt-1">On request</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-base text-[var(--muted-plum)] mb-6">
              Interested in adding any of these to your booking?
            </p>
            <BookNowButton className="btn-primary">
              Request Add-ons When Booking
            </BookNowButton>
          </div>
        </section>
      </main>

      {/* Combined Final CTA Section */}
      <section 
        className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden"
        style={{
          backgroundColor: 'var(--hero-background)'
        }}
      >
        <GradientBars colors={['var(--primary)', 'transparent']} />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16 items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.5em] text-[var(--primary)]">
                Ready when you are
              </p>
              <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl lg:text-5xl">
                Ready to Book Your Session?
              </h2>
              <h3 className="font-heading text-2xl sm:text-3xl text-[var(--primary)]">
                Book RT Spaces for your <span className="text-[var(--accent-gold)]">next</span> shoot
              </h3>
              <p className="text-lg text-[var(--primary)] leading-relaxed">
                Choose your package and book your studio session today. All
                equipment is included and ready before your call time.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <BookNowButton className="btn-primary w-full text-center">
                Book Now
              </BookNowButton>
              <Link href="/#contact" className="btn-cta w-full text-center">
                Message us
              </Link>
            </div>
          </div>
        </div>
      </section>
      <div className="relative z-20">
        <SiteFooter />
      </div>
    </div>
  );
}

