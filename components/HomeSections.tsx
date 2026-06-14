"use client";

import Image from "next/image";
import Link from "next/link";
import { BookNowButton } from "@/components/booking/BookNowButton";

const studioStats = [
  { value: "5m × 5m", label: "Floor space" },
  { value: "200+", label: "Creators served" },
  { value: "4.9/5", label: "Average rating" },
  { value: "8am–11pm", label: "Open daily" },
  { value: "E12 6BT", label: "East London" },
  { value: "100%", label: "Equipment included" },
];

/**
 * Plum trust/stats strip — sits directly below the hero for an immediate
 * brand-colour break and quick credibility.
 */
export function StatsStrip() {
  return (
    <section className="bg-[var(--primary)] py-10 text-white sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {studioStats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-3xl font-bold sm:text-4xl">{s.value}</p>
              <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The two-offer fork — mirrors how the booking wizard splits Hire vs Session,
 * so a visitor immediately sees which path is theirs.
 */
export function OfferForkSection() {
  return (
    <section className="bg-[var(--secondary)] py-16 md:py-24 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-[var(--gold-text)] mb-4">
            Two ways to book
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[var(--primary)]">
            Find your shoot
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-plum)]">
            Run the space yourself, or have us shoot it for you. Pick your path and the
            booking flow handles the rest.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2">
          {/* Hire the studio */}
          <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src="/assets/studios/4a6224d3-5683-4361-bef8-5b3b1ab5be56.jpg"
                alt="The RT Spaces studio set up for a self-run shoot"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold-text)] mb-2">
                From £55 / hour
              </p>
              <h3 className="font-heading text-2xl font-bold text-[var(--primary)]">
                Hire the studio
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-[var(--muted-plum)]">
                Full run of the 5m × 5m space with professional lighting and backdrops
                included. Bring your own photographer or shoot solo. Two-hour minimum.
              </p>
              <BookNowButton offer="hire" className="btn-primary mt-6 self-start">
                Hire the studio
              </BookNowButton>
            </div>
          </article>

          {/* Book a session */}
          <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src="/assets/studios/IMG_7857.JPG"
                alt="A guided photography session at RT Spaces"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold-text)] mb-2">
                From £110 · shot for you
              </p>
              <h3 className="font-heading text-2xl font-bold text-[var(--primary)]">
                Book a session
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-[var(--muted-plum)]">
                A guided session with editing included — portraits, couples, families and
                personal branding. We handle the lighting and direction.
              </p>
              <BookNowButton offer="session" className="btn-primary mt-6 self-start">
                Book a session
              </BookNowButton>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

const galleryShots = [
  "/assets/studios/919177f2-e71e-4881-90d0-b0eef3b4ccfc.jpg",
  "/assets/studios/3f4d65d6-7a25-44cc-a4f4-a1ded7995f3a.jpg",
  "/assets/studios/09221174-0c46-4aa0-92c0-ee51b9af5ca4.jpg",
  "/assets/studios/IMG_7856.JPG",
  "/assets/studios/IMG_7858.JPG",
  "/assets/studios/IMG_7860.JPG",
  "/assets/studios/IMG_7857.JPG",
  "/assets/studios/4a6224d3-5683-4361-bef8-5b3b1ab5be56.jpg",
];

/**
 * Gallery teaser — a photography studio should show work, not bury it on /gallery.
 */
export function GalleryTeaserSection() {
  return (
    <section className="bg-[var(--primary)] py-16 md:py-24 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[var(--accent-gold)]">
              The space
            </p>
            <h2 className="font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Recent scenes
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:text-white"
          >
            See the gallery
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {galleryShots.map((src) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-xl">
              <Image
                src={src}
                alt="Scene from the RT Spaces studio"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
