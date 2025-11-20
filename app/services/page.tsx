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
    <div className="bg-white">
      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            Services
          </p>
          <h1 className="font-heading text-4xl text-black sm:text-5xl">
            Packages built for agile content teams
          </h1>
          <p className="max-w-3xl text-lg text-zinc-600">
            Choose a simple studio hire or plug into our resident crew for
            content direction, tethered capture, and photobooth moments that
            keep your community engaged.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <article
              key={pkg.title}
              className="flex flex-col  border border-zinc-200 p-6"
            >
              <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
                {pkg.title}
              </p>
              <p className="mt-3 text-3xl font-semibold text-black">
                {pkg.price}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                {pkg.includes.map((detail) => (
                  <li key={detail}>• {detail}</li>
                ))}
              </ul>
              <Link
                href={`/contact?package=${encodeURIComponent(pkg.title)}`}
                className="mt-auto inline-flex items-center justify-center  border border-black bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black transition-colors hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Enquire
              </Link>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className=" border border-zinc-200 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
              Studio support
            </p>
            <div className="mt-6 space-y-4">
              {studioServices.map((service) => (
                <article
                  key={service.title}
                  className=" border border-zinc-200 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
                    {service.title}
                  </p>
                  <p className="mt-2 text-base text-black">{service.meta}</p>
                </article>
              ))}
            </div>
          </div>
          <div className=" border border-zinc-200 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
              Add-ons
            </p>
            <ul className="mt-6 space-y-3 text-base text-black">
              {addOns.map((addon) => (
                <li key={addon} className=" bg-[#f8f8f5] p-4">
                  {addon}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <FinalCtaSection />
        <SiteFooter />
      </main>
    </div>
  );
}

