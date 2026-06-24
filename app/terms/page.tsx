import { SiteFooter } from "@/components/StudioSections";
import { BookNowButton } from "@/components/booking/BookNowButton";
import { GradientBars } from "@/components/ui/gradient-bars";
import {
  STUDIO_TERMS_EFFECTIVE,
  STUDIO_TERMS_INTRO,
  STUDIO_TERMS_SECTIONS,
} from "@/lib/studioTerms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — RT Spaces",
  description:
    "Studio hire Terms & Conditions and client agreement for RT Spaces. Bookings, deposits, payments, late fees, damage liability, and governing law.",
};

export default function TermsPage() {
  return (
    <div className="bg-[var(--base)]">
      {/* Hero */}
      <section
        className="relative w-full pt-20 pb-12 overflow-hidden"
        style={{ backgroundColor: "var(--hero-background)" }}
      >
        <div className="absolute inset-0 w-full h-full">
          <GradientBars colors={["var(--primary)", "transparent"]} />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <BookNowButton className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)]/90 hover:text-[var(--primary)] mb-6">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to booking
          </BookNowButton>
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--primary)]/80">
            Terms &amp; Conditions
          </p>
          <h1 className="font-heading text-4xl text-[var(--primary)] sm:text-5xl lg:text-6xl mt-2">
            Studio Hire Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm text-[var(--primary)]/70">
            Effective {STUDIO_TERMS_EFFECTIVE}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-12 pb-20 sm:px-6 lg:px-8">
        <p className="text-lg text-[var(--muted-plum)] leading-relaxed mb-12">
          {STUDIO_TERMS_INTRO}
        </p>

        <div className="space-y-12">
          {STUDIO_TERMS_SECTIONS.map((section, index) => (
            <section
              key={index}
              className="border-b border-[var(--accent)]/20 pb-10 last:border-0 last:pb-0"
            >
              <h2 className="font-heading text-2xl font-semibold text-[var(--primary)] mb-4">
                {section.title}
              </h2>
              {section.body && (
                <p className="text-[var(--muted-plum)] leading-relaxed whitespace-pre-line mb-4">
                  {section.body}
                </p>
              )}
              {section.items && section.items.length > 0 && (
                <ul className="space-y-2 list-none">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[var(--muted-plum)] leading-relaxed"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--primary)]"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-[var(--accent)]/20">
          <BookNowButton className="btn-primary inline-flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to booking
          </BookNowButton>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
