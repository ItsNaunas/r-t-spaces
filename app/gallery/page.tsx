import Image from "next/image";
import { FinalCtaSection, SiteFooter, studioGallery } from "@/components/StudioSections";

const categoryFilters = [
  "All",
  "Behind the scenes",
  "Studio corners",
  "Photobooth",
  "Product",
];

export default function GalleryPage() {
  return (
    <div className="bg-white">
      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            Gallery
          </p>
          <h1 className="font-heading text-4xl text-black sm:text-5xl">
            Scenes from recent bookings
          </h1>
          <p className="max-w-3xl text-lg text-zinc-600">
            Content teams, photographers, and community builders share the space
            daily. Browse a few of our favorite captures and corners.
          </p>
        </section>

        <section className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          {categoryFilters.map((filter, index) => (
            <span
              key={filter}
              className={`rounded-full border px-4 py-2 ${
                index === 0
                  ? "border-black text-black"
                  : "border-zinc-300 text-zinc-500"
              }`}
            >
              {filter}
            </span>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studioGallery.map((item) => (
            <article
              key={item.artist}
              className="space-y-3 rounded-3xl border border-zinc-100 bg-[#f7f7f4] p-4"
            >
              <Image
                src={item.src}
                alt={item.focus}
                width={800}
                height={600}
                className="h-64 w-full rounded-2xl object-cover"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
                  {item.focus}
                </p>
                <p className="text-lg font-semibold text-black">
                  {item.artist}
                </p>
              </div>
            </article>
          ))}
        </section>

        <FinalCtaSection />
        <SiteFooter />
      </main>
    </div>
  );
}

