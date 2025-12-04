import Image from "next/image";
import Link from "next/link";
import {
  FinalCtaSection,
  SiteFooter,
} from "@/components/StudioSections";
import { studioGallery, studioServices } from "@/lib/studioData";

const studioHighlights = [
  {
    title: "Cyclorama + sets",
    detail:
      "Seamless white, textured concrete, and a cozy lounge corner ready for talent holding.",
  },
  {
    title: "Lighting & grip",
    detail:
      "Continuous LEDs, strobes, stands, modifiers, tethering table, and rolling wardrobe rack.",
  },
  {
    title: "Amenities",
    detail:
      "Dressing area, steamer, Bluetooth audio, kitchenette, and complimentary tea & coffee.",
  },
];

const availabilityBlocks = [
  {
    label: "Open hours",
    value: "Daily · 8 AM – 11 PM",
  },
  {
    label: "Address",
    value: "Unit 3E, 736-740 Romford Road, London E12 6BT",
  },
  {
    label: "Contact",
    value: "Teddy77723@gmail.com · 07944667000",
  },
];

export default function StudioPage() {
  return (
    <div className="bg-[var(--base)]">
      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
            Studio
          </p>
          <h1 className="font-heading text-4xl text-[var(--accent)] sm:text-5xl">
            Take a tour of R&amp;T Spaces
          </h1>
          <p className="max-w-3xl text-lg text-[var(--accent)]/80">
            Designed for content days, lookbooks, and community events, our East
            London studio mixes daylight with controlled lighting so you can
            pivot between clean commercial looks and warm lifestyle scenes.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden bg-[var(--accent)]/5">
            <Image
              src="/assets/44919513-a2a5-4595-af6d-e23e0acb2a87.jpg"
              alt="R&T Spaces studio overview"
              width={1400}
              height={900}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="space-y-6 border border-[var(--accent)]/20 p-6">
            <h2 className="font-heading text-2xl text-[var(--accent)]">
              Ready before you arrive
            </h2>
            <p className="text-[var(--accent)]/80">
              Send through a mood board and we&apos;ll stage the space, pre-light
              sets, and prepare any photobooth wraps or props ahead of call time.
            </p>
            <div className="space-y-4">
              {studioHighlights.map((item) => (
                <div
                  key={item.title}
                  className="border border-[var(--accent)]/20 p-4"
                >
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60">
                    {item.title}
                  </p>
                  <p className="text-base text-[var(--accent)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {availabilityBlocks.map((item) => (
            <div
              key={item.label}
              className="border border-[var(--accent)]/20 p-6 text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60"
            >
              <p>{item.label}</p>
              <p className="mt-3 text-base text-[var(--accent)] normal-case">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <h2 className="font-heading text-3xl text-[var(--accent)]">Studio services</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {studioServices.map((service) => (
              <article
                key={service.title}
                className="border border-[var(--accent)]/20 p-6"
              >
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
                  {service.title}
                </p>
                <p className="mt-3 text-lg text-[var(--accent)]">{service.meta}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Equipment List */}
        <section className="space-y-6 border-t border-[var(--accent)]/20 pt-12">
          <h2 className="font-heading text-3xl text-[var(--accent)]">
            Included Equipment
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-heading text-xl text-[var(--accent)]">
                Lighting Equipment
              </h3>
              <ul className="space-y-2 text-[var(--accent)]/80">
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Professional softboxes</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Continuous LEDs</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Strobes & modifiers</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Diffusers & reflectors</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-heading text-xl text-[var(--accent)]">
                Studio Equipment
              </h3>
              <ul className="space-y-2 text-[var(--accent)]/80">
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Light stands & grip</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tethering station</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Rolling wardrobe rack</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Steamer</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Backdrop Options */}
        <section className="space-y-6 border-t border-[var(--accent)]/20 pt-12">
          <h2 className="font-heading text-3xl text-[var(--accent)]">
            Backdrop Options
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-heading text-xl text-[var(--accent)]">
                Available Backdrops
              </h3>
              <ul className="space-y-2 text-[var(--accent)]/80">
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>White cyclorama (seamless)</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Textured grey backdrop</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Colour backdrop rolls</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Lifestyle setups & styled corners</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-heading text-xl text-[var(--accent)]">
                Props Available
              </h3>
              <ul className="space-y-2 text-[var(--accent)]/80">
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Stools & plinths</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Furniture pieces</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Neon photo booth wall</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Styling accessories</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="space-y-6 border-t border-[var(--accent)]/20 pt-12">
          <h2 className="font-heading text-3xl text-[var(--accent)]">
            Corners ready for your lens
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {studioGallery.slice(0, 4).map((item) => (
              <figure
                key={item.artist}
                className="space-y-3 border border-[var(--accent)]/10 bg-[var(--base)] p-4"
              >
                <Image
                  src={item.src}
                  alt={item.focus}
                  width={1000}
                  height={800}
                  className="h-64 w-full object-cover"
                />
                <figcaption className="text-sm text-[var(--accent)]/80">
                  {item.focus}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Book This Studio CTA */}
        <section className="text-center space-y-6 border-t border-[var(--accent)]/20 pt-12">
          <h2 className="font-heading text-3xl text-[var(--accent)]">
            Ready to Book This Studio?
          </h2>
          <p className="text-lg text-[var(--accent)]/80 max-w-2xl mx-auto">
            Reserve your studio time today. All equipment is included and ready
            before your call time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-online" className="btn-primary">
              Book This Studio
            </Link>
            <Link href="/equipment" className="btn-secondary">
              View Equipment
            </Link>
          </div>
        </section>

        <FinalCtaSection />
        <SiteFooter />
      </main>
    </div>
  );
}

