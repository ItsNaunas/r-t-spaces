import Image from "next/image";
import Link from "next/link";

const valueList = [
  {
    label: "Daylight-ready studio",
    detail: "White cyclorama plus styled corners for clean or cozy sets.",
  },
  {
    label: "Plug-and-play kit",
    detail: "Lighting, stands, and vanity zones prepped before call time.",
  },
  {
    label: "Flexible booking windows",
    detail: "Open daily 8 AM – 11 PM for short-form sprints or long productions.",
  },
  {
    label: "Photobooth add-ons",
    detail: "Brandable booth experiences for launches, pop-ups, and parties.",
  },
];

export const studioServices = [
  {
    title: "Studio Hire",
    meta: "Hourly + daily rates · East London · Equipment included",
  },
  {
    title: "Creative Session",
    meta: "Resident photographer, tethered capture, direction support",
  },
  {
    title: "Photobooth Packages",
    meta: "Neon wall, instant prints, on-site host",
  },
];

export const studioGallery = [
  {
    artist: "Behind the Lens",
    focus: "Tethered capture",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
  },
  {
    artist: "Rose on Set",
    focus: "Content day",
    src: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80",
  },
  {
    artist: "Studio Corners",
    focus: "Styled lounge",
    src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
  },
  {
    artist: "Gear Prep",
    focus: "Lighting ready",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  },
  {
    artist: "Minimal Props",
    focus: "Stools & plinths",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  },
  {
    artist: "Neon Motto",
    focus: "Photo booth wall",
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
];

export function StorySection() {
  return (
    <section className="bg-white px-2 py-12 sm:px-4 lg:px-0">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            About R&amp;T Spaces
          </p>
          <h2 className="font-heading text-4xl leading-tight text-black lg:text-5xl">
            A home for creators, brand launches, and portrait sessions in East
            London.
          </h2>
          <p className="text-lg text-zinc-600">
            Founded by Rose &amp; Teddy, R&amp;T Spaces pairs a calming studio
            with ready-to-roll equipment so you can focus on directing talent,
            shooting content, or hosting clients.
          </p>
        </div>
        <div className="grid gap-6">
          {valueList.map((value, index) => (
            <div
              key={value.label}
              className="flex gap-5 border-t border-zinc-200 pt-6"
            >
              <div className="text-sm font-semibold text-zinc-500">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <p className="font-semibold text-black">{value.label}</p>
                <p className="text-sm text-zinc-600">{value.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MissionSection() {
  return (
    <section className="grid gap-10 bg-white px-2 py-12 sm:px-4 lg:grid-cols-2 lg:px-0">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
          Translate your vision
        </p>
        <h3 className="font-heading text-4xl text-black">
          Pick the service that fits your shoot day.
        </h3>
        <p className="text-lg text-zinc-600">
          Whether you need four walls and great light or prefer our crew to jump
          in, we tailor bookings to your run sheet and deliverables.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full border border-black bg-black px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Book studio
        </Link>
      </div>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl bg-zinc-100">
          <Image
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
            alt="Creative direction"
            width={800}
            height={600}
            className="h-[360px] w-full object-cover sm:h-[420px]"
          />
        </div>
        <div className="rounded-3xl border border-zinc-200 p-6">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            Our services
          </p>
          <div className="mt-6 space-y-5">
            {studioServices.map((service) => (
              <div key={service.title} className="border-t border-zinc-200 pt-4">
                <p className="font-semibold text-black">{service.title}</p>
                <p className="text-sm text-zinc-600">{service.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedWorkSection() {
  return (
    <section className="bg-white px-2 py-12 sm:px-4 lg:px-0">
      <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
        See our work
      </p>
      <h3 className="mt-4 font-heading text-4xl text-black lg:text-5xl">
        Glimpses from the studio floor.
      </h3>

      <div className="mt-10 overflow-hidden rounded-[32px] bg-zinc-900">
        <Image
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80"
          alt="Featured project"
          width={1400}
          height={800}
          className="h-[320px] w-full object-cover sm:h-[420px]"
          priority
        />
      </div>

      <div className="mt-8 grid gap-6 border-t border-zinc-200 pt-8 text-sm text-zinc-600 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            Featured Session
          </p>
          <p className="mt-2 text-base font-semibold text-black">
            InTheSpotlight Content Day
          </p>
        </div>
        <p className="lg:col-span-2">
          Tethered capture, seamless wardrobe changes, and styled corners that
          keep creators comfortable while delivering polished imagery.
        </p>
        <div className="space-y-3 text-sm">
          <p>
            <span className="font-semibold text-black">Location:</span> Unit 3E,
            736-740 Romford Road, London
          </p>
          <p>
            <span className="font-semibold text-black">Hours:</span> Open daily
            8 AM – 11 PM
          </p>
        </div>
      </div>
    </section>
  );
}

export function GallerySection() {
  return (
    <section className="bg-white px-2 py-12 sm:px-4 lg:px-0">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-3xl text-black">Studio Archive</h3>
        <Link
          href="https://www.instagram.com/randtspace"
          className="text-sm font-semibold uppercase tracking-[0.3em]"
          target="_blank"
        >
          Follow @randtspace →
        </Link>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {studioGallery.map((item) => (
          <article
            key={item.artist}
            className="space-y-3 rounded-3xl border border-zinc-100 bg-[#f7f7f4] p-4 shadow-[inset_0_0_0_1px_#fff]"
          >
            <div className="overflow-hidden rounded-2xl">
              <Image
                src={item.src}
                alt={item.artist}
                width={500}
                height={500}
                className="h-64 w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
                {item.focus}
              </p>
              <p className="text-xl font-semibold text-black">{item.artist}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="grid gap-6 bg-black px-6 py-12 text-white sm:px-8 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <p className="text-sm uppercase tracking-[0.5em] text-white/70">
          Ready when you are
        </p>
        <h3 className="mt-4 font-heading text-4xl">
          Book R&amp;T Spaces for your next shoot
        </h3>
      </div>
      <div className="flex items-center justify-end">
        <Link
          href="/contact"
          className="rounded-full border border-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.4em] text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Message us
        </Link>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-white px-2 py-12 text-sm text-zinc-600 sm:px-4 lg:px-0">
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3">
          <span className="text-lg font-semibold text-black">R&amp;T Spaces</span>
          <p>
            Photography studio hire, creative sessions, and photobooth packages
            led by Rose &amp; Teddy in East London.
          </p>
          <div className="flex gap-3 text-black">
            <Link
              href="https://www.instagram.com/randtspace"
              className="font-semibold"
              target="_blank"
            >
              Instagram
            </Link>
            <Link href="mailto:Teddy77723@gmail.com" className="font-semibold">
              Email
            </Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            Address
          </p>
          <p className="mt-2 text-black">Unit 3E, Room 1</p>
          <p>736-740 Romford Road, London E12 6BT</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            Contact
          </p>
          <p className="text-black">Teddy77723@gmail.com</p>
          <p className="text-black">07944667000</p>
          <p>Open daily · 8 AM – 11 PM</p>
        </div>
      </div>
      <div className="mt-10 border-t border-zinc-200 pt-6 text-xs uppercase tracking-[0.4em] text-zinc-500">
        © {new Date().getFullYear()} R&amp;T Spaces
      </div>
    </footer>
  );
}

