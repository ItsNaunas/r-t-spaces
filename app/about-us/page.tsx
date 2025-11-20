import { SiteFooter } from "@/components/StudioSections";

export default function AboutUsPage() {
  return (
    <div className="bg-white">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-12 sm:gap-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            About Us
          </p>
          <h1 className="font-heading text-4xl text-black sm:text-5xl">
            About R&amp;T Spaces
          </h1>
          <div className="max-w-3xl space-y-6 text-lg text-zinc-600">
            <p>
              Founded by Rose &amp; Teddy, R&amp;T Spaces pairs a calming studio
              with ready-to-roll equipment so you can focus on directing talent,
              shooting content, or hosting clients.
            </p>
            <p>
              A home for creators, brand launches, and portrait sessions in East
              London. Our East London studio is designed for content days, lookbooks, and community events.
            </p>
            <p>
              Whether you need four walls and great light or prefer our crew to jump
              in, we tailor bookings to your run sheet and deliverables.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

