import Image from "next/image";
import Link from "next/link";

const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    label: "Content Days",
  },
  {
    src: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80",
    label: "Studio Hire",
  },
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    label: "Neon Booth",
  },
];

export function HeroSection() {
  return (
    <section className="bg-white px-2 py-10 sm:px-4 lg:px-0">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:gap-16">
        <div className="flex-1 space-y-6">
          <h1 className="font-heading text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.9] text-black">
            R&amp;T Spaces
          </h1>
          <p className="max-w-xl text-lg text-zinc-600">
            Hire a polished, daylight studio by the hour or day, bring in your
            own crew, or tap our resident team for tethered shoots and
            photobooth add-ons.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-black bg-black px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-transform transition-colors hover:-translate-y-0.5 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Book studio
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-full border border-black bg-white px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black transition-transform transition-colors hover:-translate-y-0.5 hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              View packages
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 text-left text-xs uppercase text-zinc-600 lg:w-64">
          <span className="font-semibold text-black">#rtspaces</span>
          <p className="text-zinc-500">
            Rose &amp; Teddy&apos;s daylight-ready studio hire in East London,
            open daily 8 AM – 11 PM with photobooth packages on request.
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {heroImages.map((image) => (
          <figure
            key={image.label}
            className="relative overflow-hidden rounded-3xl bg-zinc-100"
          >
            <Image
              src={image.src}
              alt={image.label}
              width={600}
              height={800}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
              priority
            />
            <figcaption className="pointer-events-none absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/60 to-transparent p-6 text-lg font-semibold text-white">
              {image.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

