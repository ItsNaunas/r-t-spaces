import { Suspense } from "react";
import Link from "next/link";
import { FinalCtaSection, SiteFooter } from "@/components/StudioSections";
import { BookingForm } from "@/components/BookingForm";

const contactDetails = [
  { 
    label: "Email", 
    value: "Teddy77723@gmail.com",
    href: "mailto:Teddy77723@gmail.com",
  },
  { 
    label: "Instagram", 
    value: "@randtspace",
    href: "https://www.instagram.com/randtspace",
    external: true,
  },
  { 
    label: "Phone", 
    value: "07944667000",
    href: "tel:07944667000",
  },
];

const openingHours = [
  { day: "Monday - Sunday", hours: "8 AM – 11 PM" },
];

export default function ContactPage() {
  return (
    <div className="bg-[var(--base)]">
      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
            Contact
          </p>
          <h1 className="font-heading text-4xl text-[var(--accent)] sm:text-5xl lg:text-6xl">
            Get In Touch
          </h1>
          <p className="max-w-3xl text-lg text-[var(--accent)]/80">
            Have questions? Want to book a session? Send us a message or reach
            out directly. We&apos;re here to help make your creative vision a
            reality.
          </p>
        </section>

        {/* Contact Form and Info Grid */}
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-heading text-2xl text-[var(--accent)] mb-6">
              Send Us a Message
            </h2>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center border border-[var(--accent)]/20 p-6 text-sm text-[var(--accent)]/80">
                  Loading form…
                </div>
              }
            >
              <BookingForm />
            </Suspense>
          </div>

          <div className="space-y-6">
            {/* Location with Map */}
            <div className="border border-[var(--accent)]/20 p-6 space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
                Visit us
              </p>
              <p className="text-lg font-semibold text-[var(--accent)]">
                Unit 3E, 736-740 Romford Road, London E12 6BT
              </p>
              <p className="text-sm text-[var(--accent)]/80">
                On-site parking after 6 PM · Stratford station 12 mins by bus.
              </p>
              
              {/* Google Maps Embed */}
              <div className="relative w-full h-64 overflow-hidden border border-[var(--accent)]/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.1234567890!2d0.0436!3d51.5494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMyJzU3LjgiTiAwwrAwMiczNy4wIkU!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="R&T Spaces Location"
                  className="absolute inset-0"
                />
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Unit+3E,+736-740+Romford+Road,+London+E12+6BT"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--primary)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
              >
                Open in Google Maps
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              {contactDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="border border-[var(--accent)]/20 p-4"
                >
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60 mb-2">
                    {detail.label}
                  </p>
                  {detail.href ? (
                    <a
                      href={detail.href}
                      target={detail.external ? "_blank" : undefined}
                      rel={detail.external ? "noopener noreferrer" : undefined}
                      className="text-lg text-[var(--accent)] hover:text-[var(--primary)] transition-colors normal-case"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    <p className="text-lg text-[var(--accent)] normal-case">
                      {detail.value}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Opening Hours */}
            <div className="border border-[var(--accent)]/20 p-6 bg-[var(--accent)]/5">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60 mb-4">
                Opening Hours
              </p>
              <div className="space-y-2">
                {openingHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-base text-[var(--accent)] font-semibold">
                      {schedule.day}
                    </span>
                    <span className="text-base text-[var(--accent)]/80">
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--accent)]/60 mt-4">
                Extended hours available upon request
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="border-t border-[var(--accent)]/20 pt-12">
          <h2 className="font-heading text-2xl text-[var(--accent)] mb-6 text-center">
            Quick Actions
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-online" className="btn-primary">
              Book Online
            </Link>
            <Link href="/studio" className="btn-secondary">
              View Studios
            </Link>
            <Link href="/services" className="btn-secondary">
              View Pricing
            </Link>
          </div>
        </section>

        <FinalCtaSection />
        <SiteFooter />
      </main>
    </div>
  );
}

