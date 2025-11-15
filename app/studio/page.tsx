import Image from "next/image";
import {
  FinalCtaSection,
  SiteFooter,
  studioGallery,
  studioServices,
} from "@/components/StudioSections";

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
    <div className="bg-white">
      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            Studio
          </p>
          <h1 className="font-heading text-4xl text-black sm:text-5xl">
            Take a tour of R&amp;T Spaces
          </h1>
          <p className="max-w-3xl text-lg text-zinc-600">
            Designed for content days, lookbooks, and community events, our East
            London studio mixes daylight with controlled lighting so you can
            pivot between clean commercial looks and warm lifestyle scenes.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[32px] bg-zinc-100">
            <Image
              src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80"
              alt="R&T Spaces studio overview"
              width={1400}
              height={900}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="space-y-6 rounded-[32px] border border-zinc-200 p-6">
            <h2 className="font-heading text-2xl text-black">
              Ready before you arrive
            </h2>
            <p className="text-zinc-600">
              Send through a mood board and we&apos;ll stage the space, pre-light
              sets, and prepare any photobooth wraps or props ahead of call time.
            </p>
            <div className="space-y-4">
              {studioHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-zinc-200 p-4"
                >
                  <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                    {item.title}
                  </p>
                  <p className="text-base text-black">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {availabilityBlocks.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-zinc-200 p-6 text-sm uppercase tracking-[0.3em] text-zinc-500"
            >
              <p>{item.label}</p>
              <p className="mt-3 text-base text-black normal-case">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <h2 className="font-heading text-3xl text-black">Studio services</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {studioServices.map((service) => (
              <article
                key={service.title}
                className="rounded-3xl border border-zinc-200 p-6"
              >
                <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
                  {service.title}
                </p>
                <p className="mt-3 text-lg text-black">{service.meta}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-heading text-3xl text-black">
            Corners ready for your lens
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {studioGallery.slice(0, 4).map((item) => (
              <figure
                key={item.artist}
                className="space-y-3 rounded-3xl border border-zinc-100 bg-[#f7f7f4] p-4"
              >
                <Image
                  src={item.src}
                  alt={item.focus}
                  width={1000}
                  height={800}
                  className="h-64 w-full rounded-2xl object-cover"
                />
                <figcaption className="text-sm text-zinc-600">
                  {item.focus}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <FinalCtaSection />
        <SiteFooter />
      </main>
    </div>
  );
}

