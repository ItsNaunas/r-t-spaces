"use client";

import { Suspense } from "react";
import Link from "next/link";
import { FinalCtaSection, SiteFooter } from "@/components/StudioSections";
import { BookingForm } from "@/components/BookingForm";
import { GradientBars } from "@/components/ui/gradient-bars";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

const contactDetails = [
  { 
    label: "Email", 
    value: "Teddy77723@gmail.com",
    href: "mailto:Teddy77723@gmail.com",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  { 
    label: "Instagram", 
    value: "@randtspace",
    href: "https://www.instagram.com/randtspace",
    external: true,
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  { 
    label: "Phone", 
    value: "07944667000",
    href: "tel:07944667000",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
];

const openingHours = [
  { day: "Monday - Sunday", hours: "8 AM – 11 PM" },
];

export default function ContactPage() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: infoRef, isVisible: infoVisible } = useScrollAnimation();

  return (
    <div className="bg-[var(--base)]">
      {/* Hero Header Section - Matching Homepage Style */}
      <section 
        className="relative pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, var(--primary) 0%, oklch(0.50 0.06 312) 50%, oklch(0.70 0.05 312) 100%)'
        }}
      >
        <GradientBars colors={['var(--primary)', 'transparent']} />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={headerRef}
            className={`max-w-4xl transition-all duration-700 ${
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-sm uppercase tracking-[0.4em] text-white/80 mb-4 sm:mb-6">
              Contact
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6 sm:mb-8">
              Get In Touch
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-3xl">
              Have questions? Want to book a session? Send us a message or reach
              out directly. We&apos;re here to help make your creative vision a
              reality.
            </p>
          </div>
        </div>
      </section>

      <main className="w-full">
        {/* Contact Form and Info Section - Enhanced Layout */}
        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.2fr_1fr]">
              
              {/* Left Column - Contact Form */}
              <div 
                ref={formRef}
                className={`transition-all duration-700 delay-100 ${
                  formVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="bg-white p-6 sm:p-8 lg:p-10 shadow-lg border border-[var(--lavender)]/30">
                  <div className="mb-6 sm:mb-8">
                    <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-3">
                      Send Us a Message
                    </p>
                    <h2 className="font-heading text-3xl sm:text-4xl text-[var(--primary)] leading-tight">
                      Let&apos;s Start a Conversation
                    </h2>
                    <p className="text-base sm:text-lg text-[var(--muted-plum)] mt-4 leading-relaxed">
                      Fill out the form below and we&apos;ll get back to you as soon as possible. 
                      For urgent inquiries, give us a call.
                    </p>
                  </div>
                  
                  <Suspense
                    fallback={
                      <div className="flex h-64 items-center justify-center border border-[var(--accent)]/20 p-6 text-sm text-[var(--muted-plum)]">
                        Loading form…
                      </div>
                    }
                  >
                    <BookingForm />
                  </Suspense>
                </div>
              </div>

              {/* Right Column - Contact Information */}
              <div 
                ref={infoRef}
                className={`space-y-6 transition-all duration-700 delay-200 ${
                  infoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                {/* Contact Details Cards */}
                <div className="space-y-4">
                  {contactDetails.map((detail, index) => (
                    <a
                      key={detail.label}
                      href={detail.href}
                      target={detail.external ? "_blank" : undefined}
                      rel={detail.external ? "noopener noreferrer" : undefined}
                      className="group block bg-white p-5 sm:p-6 border border-[var(--lavender)]/30 hover:border-[var(--primary)]/50 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-300">
                          {detail.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)] mb-1.5">
                            {detail.label}
                          </p>
                          <p className="text-base sm:text-lg font-medium text-[var(--primary)] group-hover:text-[var(--accent-gold)] transition-colors normal-case break-words">
                            {detail.value}
                          </p>
                        </div>
                        <svg 
                          className="w-5 h-5 text-[var(--muted-plum)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0 mt-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Opening Hours Card */}
                <div className="bg-white p-6 sm:p-7 border border-[var(--lavender)]/30">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
                      Opening Hours
                    </p>
                  </div>
                  <div className="space-y-3">
                    {openingHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center pb-3 border-b border-[var(--lavender)]/20 last:border-0">
                        <span className="text-base sm:text-lg text-[var(--primary)] font-semibold">
                          {schedule.day}
                        </span>
                        <span className="text-base sm:text-lg text-[var(--muted-plum)]">
                          {schedule.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--muted-plum)] mt-5 italic">
                    Extended hours available upon request
                  </p>
                </div>

                {/* Location Card */}
                <div className="bg-white p-6 sm:p-7 border border-[var(--lavender)]/30">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
                      Visit Us
                    </p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-[var(--primary)] mb-2">
                    Unit 3E, 736-740 Romford Road
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-[var(--primary)] mb-3">
                    London E12 6BT
                  </p>
                  <p className="text-sm text-[var(--muted-plum)] mb-4 leading-relaxed">
                    On-site parking available after 6 PM · Stratford station 12 mins by bus
                  </p>
                  
                  {/* Google Maps Embed */}
                  <div className="relative w-full h-56 sm:h-64 overflow-hidden border border-[var(--lavender)]/20 mb-4">
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
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--accent-gold)] transition-colors group"
                  >
                    Open in Google Maps
                    <svg 
                      className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Section - Enhanced */}
        <section className="relative py-12 sm:py-16 lg:py-20 bg-white border-t border-[var(--lavender)]/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-3">
                Quick Actions
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-[var(--primary)] leading-tight">
                What Would You Like to Do?
              </h2>
              <p className="text-base sm:text-lg text-[var(--muted-plum)] mt-4 max-w-2xl mx-auto">
                Explore our studios, check pricing, or book your session directly online.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link 
                href="/book-online" 
                className="btn-primary w-full sm:w-auto min-w-[200px] text-center"
              >
                Book Online
              </Link>
              <Link 
                href="/studio" 
                className="btn-secondary w-full sm:w-auto min-w-[200px] text-center"
              >
                View Studios
              </Link>
              <Link 
                href="/services" 
                className="btn-secondary w-full sm:w-auto min-w-[200px] text-center"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        <FinalCtaSection />
        <SiteFooter />
      </main>
    </div>
  );
}

