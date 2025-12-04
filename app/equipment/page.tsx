import Image from "next/image";
import Link from "next/link";
import { SiteFooter, FinalCtaSection } from "@/components/StudioSections";

const equipmentCategories = [
  {
    title: "Lighting Equipment",
    items: [
      {
        name: "Professional Softboxes",
        description: "High-end softboxes for soft, even illumination",
        image: "/assets/5448c683-ea0d-43cb-8ca6-c407b47ba93e.jpg",
      },
      {
        name: "Continuous LEDs",
        description: "Professional LED panels for video work and continuous lighting",
        image: "/assets/5448c683-ea0d-43cb-8ca6-c407b47ba93e.jpg",
      },
      {
        name: "Strobes & Modifiers",
        description: "Studio strobes with various modifiers and reflectors",
        image: "/assets/5448c683-ea0d-43cb-8ca6-c407b47ba93e.jpg",
      },
      {
        name: "Diffusers & Reflectors",
        description: "Complete set of diffusers and reflectors for precise light control",
        image: "/assets/5448c683-ea0d-43cb-8ca6-c407b47ba93e.jpg",
      },
    ],
  },
  {
    title: "Studio Equipment",
    items: [
      {
        name: "Light Stands & Grip",
        description: "Professional light stands and grip equipment",
        image: "/assets/5448c683-ea0d-43cb-8ca6-c407b47ba93e.jpg",
      },
      {
        name: "Tethering Station",
        description: "Dedicated tethering setup for immediate review",
        image: "/assets/71d985ec-e79d-4ac5-89e4-f5785077064a.jpg",
      },
      {
        name: "Rolling Wardrobe Rack",
        description: "Mobile wardrobe rack for easy outfit changes",
        image: "/assets/5448c683-ea0d-43cb-8ca6-c407b47ba93e.jpg",
      },
      {
        name: "Steamer",
        description: "Professional garment steamer for wrinkle-free looks",
        image: "/assets/5448c683-ea0d-43cb-8ca6-c407b47ba93e.jpg",
      },
    ],
  },
  {
    title: "Backdrops",
    items: [
      {
        name: "White Cyclorama",
        description: "Seamless white cyclorama for clean commercial shots",
        image: "/assets/44919513-a2a5-4595-af6d-e23e0acb2a87.jpg",
      },
      {
        name: "Textured Grey",
        description: "Textured grey backdrop for editorial depth",
        image: "/assets/aaeebd1e-e1b8-4548-9052-39a53a169559.jpg",
      },
      {
        name: "Colour Rolls",
        description: "Curated collection of coloured backdrop rolls",
        image: "/assets/aaeebd1e-e1b8-4548-9052-39a53a169559.jpg",
      },
      {
        name: "Lifestyle Setups",
        description: "Styled lounge corners and lifestyle setups",
        image: "/assets/aaeebd1e-e1b8-4548-9052-39a53a169559.jpg",
      },
    ],
  },
  {
    title: "Props & Styling",
    items: [
      {
        name: "Stools & Plinths",
        description: "Minimalist stools and plinths for product and portrait work",
        image: "/assets/9450092a-7996-44d5-87f7-ec9281017f5d.jpg",
      },
      {
        name: "Furniture Pieces",
        description: "Curated furniture for styled lifestyle shots",
        image: "/assets/aaeebd1e-e1b8-4548-9052-39a53a169559.jpg",
      },
      {
        name: "Neon Photo Booth Wall",
        description: "Brandable neon wall with custom wraps for events",
        image: "/assets/00cb384c-557d-425f-ae56-72d83509cef7.jpg",
      },
      {
        name: "Styling Accessories",
        description: "Various styling accessories and decorative elements",
        image: "/assets/9450092a-7996-44d5-87f7-ec9281017f5d.jpg",
      },
    ],
  },
];

export default function EquipmentPage() {
  return (
    <div className="bg-[var(--base)]">
      <main className="mx-auto w-full max-w-7xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
            Equipment & Backdrops
          </p>
          <h1 className="font-heading text-4xl text-[var(--accent)] sm:text-5xl lg:text-6xl">
            Complete Studio Equipment
          </h1>
          <p className="max-w-3xl text-lg text-[var(--accent)]/80">
            Every piece of equipment you need for a successful shoot is included
            in your booking. From professional lighting to versatile backdrops,
            we&apos;ve curated a complete kit ready for your creative vision.
          </p>
        </section>

        {/* Equipment Categories */}
        {equipmentCategories.map((category, categoryIndex) => (
          <section key={category.title} className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-3xl text-[var(--accent)] sm:text-4xl">
                {category.title}
              </h2>
              {categoryIndex === 0 && (
                <Link
                  href="/book-online"
                  className="btn-primary btn-small hidden md:inline-flex"
                >
                  Check Availability
                </Link>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {category.items.map((item, itemIndex) => (
                <article
                  key={item.name}
                  className="group border border-[var(--accent)]/10 bg-[var(--base)] p-4 hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative aspect-square overflow-hidden mb-4">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      quality={85}
                    />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-[var(--accent)] mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-[var(--accent)]/80">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>

            {/* CTA after first category */}
            {categoryIndex === 0 && (
              <div className="md:hidden text-center pt-4">
                <Link href="/book-online" className="btn-primary btn-small">
                  Check Availability
                </Link>
              </div>
            )}
          </section>
        ))}

        {/* Additional Info Section */}
        <section className="grid gap-6 lg:grid-cols-2 border-t border-[var(--accent)]/20 pt-12">
          <div className="space-y-4">
            <h3 className="font-heading text-2xl text-[var(--accent)]">
              All Equipment Included
            </h3>
            <p className="text-[var(--accent)]/80">
              Every piece of equipment listed is included in your studio hire at
              no additional cost. Our team preps everything before your call time
              so you can focus on creating.
            </p>
            <ul className="space-y-2 text-[var(--accent)]/80">
              <li className="flex items-start gap-2">
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
                <span>All equipment prepped before your arrival</span>
              </li>
              <li className="flex items-start gap-2">
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
                <span>Professional lighting setup included</span>
              </li>
              <li className="flex items-start gap-2">
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
                <span>Multiple backdrop options available</span>
              </li>
              <li className="flex items-start gap-2">
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
                <span>On-call support for equipment questions</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-heading text-2xl text-[var(--accent)]">
              Need Something Specific?
            </h3>
            <p className="text-[var(--accent)]/80">
              Have a specific piece of equipment in mind? Let us know when you
              book and we&apos;ll confirm availability or suggest alternatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book-online" className="btn-primary">
                Book Now
              </Link>
              <Link href="/contact" className="btn-secondary">
                Ask About Equipment
              </Link>
            </div>
          </div>
        </section>

        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}

