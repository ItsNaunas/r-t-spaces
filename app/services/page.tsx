import Link from "next/link";
import { FinalCtaSection, SiteFooter } from "@/components/StudioSections";
import { studioServices } from "@/lib/studioData";

const packages = [
  {
    title: "Half-Day Hire",
    price: "£320",
    includes: [
      "4 hours · Monday–Friday",
      "Lighting kit + tether station",
      "Pre-set backgrounds + props",
    ],
  },
  {
    title: "Full-Day Hire",
    price: "£580",
    includes: [
      "9 hours · any day",
      "Lighting, grip, and crew support",
      "Load-in assistance + storage",
    ],
  },
  {
    title: "Resident Creative Session",
    price: "From £750",
    includes: [
      "Photographer + light tech",
      "Tethered capture workflow",
      "In-session direction + selects",
    ],
  },
];

const addOns = [
  "Neon photobooth wall with custom wraps",
  "Instant prints + branded templates",
  "Editorial stylist + grooming partners",
  "Catering recommendations & concierge",
];

export default function ServicesPage() {
  return (
    <div className="bg-[var(--base)]">
      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
            Packages / Pricing
          </p>
          <h1 className="font-heading text-4xl text-[var(--primary)] sm:text-5xl lg:text-6xl">
            Packages & Pricing
          </h1>
          <p className="max-w-3xl text-lg text-[var(--muted-plum)]">
            Choose a simple studio hire or plug into our resident crew for
            content direction, tethered capture, and photobooth moments that
            keep your community engaged.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <article
              key={pkg.title}
              className="flex flex-col border border-[var(--accent)]/20 p-6 hover:border-[var(--primary)] transition-all duration-300 rounded-lg"
            >
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
                {pkg.title}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--primary)]">
                {pkg.price}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted-plum)]">
                {pkg.includes.map((detail) => (
                  <li key={detail} className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-[var(--primary)] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/book-online?package=${encodeURIComponent(pkg.title)}`}
                className="mt-auto btn-primary btn-small"
              >
                Book Now
              </Link>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-[var(--accent)]/20 p-6 rounded-lg">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
              Studio support
            </p>
            <div className="mt-6 space-y-4">
              {studioServices.map((service) => (
                <article
                  key={service.title}
                  className="border border-[var(--accent)]/20 p-4 rounded-lg"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-plum)]">
                    {service.title}
                  </p>
                  <p className="mt-2 text-base text-[var(--primary)]">{service.meta}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="border border-[var(--accent)]/20 p-6 rounded-lg">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
              Add-ons
            </p>
            <ul className="mt-6 space-y-3 text-base text-[var(--muted-plum)]">
              {addOns.map((addon) => (
                <li key={addon} className="bg-[var(--accent)]/5 p-4 rounded-lg">
                  {addon}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Book Now CTA Section */}
        <section className="text-center space-y-6 border-t border-[var(--accent)]/20 pt-12">
          <h2 className="font-heading text-3xl text-[var(--primary)]">
            Ready to Book?
          </h2>
          <p className="text-lg text-[var(--muted-plum)] max-w-2xl mx-auto">
            Choose your package and book your studio session today. All
            equipment is included and ready before your call time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-online" className="btn-primary">
              Book Now
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </section>

        <FinalCtaSection />
        <SiteFooter />
      </main>
    </div>
  );
}

