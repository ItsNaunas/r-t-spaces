import { Suspense } from "react";
import { FinalCtaSection, SiteFooter } from "@/components/StudioSections";
import { BookingForm } from "@/components/BookingForm";

const contactDetails = [
  { label: "Email", value: "Teddy77723@gmail.com" },
  { label: "Instagram", value: "@randtspace" },
  { label: "Phone", value: "07944667000" },
  { label: "Hours", value: "Daily · 8 AM – 11 PM" },
];

export default function ContactPage() {
  return (
    <div className="bg-[var(--base)]">
      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
            Contact
          </p>
          <h1 className="font-heading text-4xl text-[var(--accent)] sm:text-5xl">
            Book R&amp;T Spaces
          </h1>
          <p className="max-w-3xl text-lg text-[var(--accent)]/80">
            Send us the date, hours, and shot list you have in mind. We&apos;ll
            confirm availability, share access info, and prep the studio for your
            crew.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center border border-[var(--accent)]/20 p-6 text-sm text-[var(--accent)]/80">
                Loading form…
              </div>
            }
          >
            <BookingForm />
          </Suspense>

          <div className="space-y-6 border border-[var(--accent)]/20 p-6">
            <div className="bg-[var(--accent)]/5 p-6">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
                Visit us
              </p>
              <p className="mt-3 text-lg text-[var(--accent)]">
                Unit 3E, 736-740 Romford Road, London E12 6BT
              </p>
              <p className="mt-2 text-sm text-[var(--accent)]/80">
                On-site parking after 6 PM · Stratford station 12 mins by bus.
              </p>
            </div>
            <div className="space-y-4">
              {contactDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="border border-[var(--accent)]/20 p-4 text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60"
                >
                  <p>{detail.label}</p>
                  <p className="mt-2 text-lg text-[var(--accent)] normal-case">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FinalCtaSection />
        <SiteFooter />
      </main>
    </div>
  );
}

