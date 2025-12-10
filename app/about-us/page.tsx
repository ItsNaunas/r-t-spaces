"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SiteFooter } from "@/components/StudioSections";
import { GradientBars } from "@/components/ui/gradient-bars";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

const companyInfo = {
  name: "R&T Spaces",
  founded: "2024",
  location: "East London",
  address: "Unit 3E, 736-740 Romford Road, London E12 6BT",
  email: "Teddy77723@gmail.com",
  phone: "07944667000",
};

const values = [
  {
    title: "Creativity First",
    description:
      "We believe in providing spaces that inspire and enable creative expression without limitations.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Professional Excellence",
    description:
      "Every detail is considered, from equipment prep to studio cleanliness, ensuring a professional experience.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: "Community Focus",
    description:
      "We're building a community of creators, photographers, and brands who value quality and collaboration.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Accessibility",
    description:
      "Flexible booking options and transparent pricing make professional studio space accessible to all creators.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function AboutUsPage() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: storyRef, isVisible: storyVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="bg-[var(--base)]">
      {/* Hero Section - Matching Homepage Style */}
      <section 
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, var(--primary) 0%, oklch(0.50 0.06 312) 50%, oklch(0.70 0.05 312) 100%)'
        }}
      >
        <GradientBars colors={['var(--primary)', 'transparent']} />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div 
            ref={heroRef}
            className={`transition-all duration-700 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <p className="text-sm uppercase tracking-[0.4em] text-white/80">
                About Us
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
                A home for creators, brand launches, and <span className="font-script italic">portrait sessions</span> in East London
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Founded by Rose &amp; Teddy, R&amp;T Spaces pairs a calming studio
                with ready-to-roll equipment so you can focus on creating.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/book-online" className="btn-primary">
                  Book a Session
                </Link>
                <Link href="/contact" className="bg-white text-[var(--primary)] hover:bg-white/90 border-2 border-white px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm sm:text-sm tracking-[0.05em] transition-all duration-300 inline-flex items-center justify-center">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="w-full">
        {/* Story Section - Two Column Layout with Image */}
        <section 
          ref={storyRef}
          className={`py-16 md:py-24 lg:py-32 bg-white transition-all duration-700 ${
            storyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 items-center">
              {/* Left: Text Content */}
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
                  Our Story
                </p>
                <h2 className="font-heading text-4xl leading-tight text-[var(--primary)] lg:text-5xl">
                  A home for creators, brand launches, and portrait sessions in East London.
                </h2>
                <p className="text-lg text-[var(--muted-plum)] leading-relaxed">
                  Founded by Rose &amp; Teddy, R&amp;T Spaces pairs a calming studio
                  with ready-to-roll equipment so you can focus on directing talent,
                  shooting content, or hosting clients.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-5 border-t border-[var(--lavender)] pt-6">
                    <div className="text-sm font-semibold text-[var(--muted-plum)]">
                      01
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--primary)]">Daylight-ready studio</p>
                      <p className="text-sm text-[var(--muted-plum)]">White cyclorama plus styled corners for clean or cozy sets.</p>
                    </div>
                  </div>
                  <div className="flex gap-5 border-t border-[var(--lavender)] pt-6">
                    <div className="text-sm font-semibold text-[var(--muted-plum)]">
                      02
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--primary)]">Plug-and-play kit</p>
                      <p className="text-sm text-[var(--muted-plum)]">Lighting, stands, and vanity zones prepped before call time.</p>
                    </div>
                  </div>
                  <div className="flex gap-5 border-t border-[var(--lavender)] pt-6">
                    <div className="text-sm font-semibold text-[var(--muted-plum)]">
                      03
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--primary)]">Flexible booking windows</p>
                      <p className="text-sm text-[var(--muted-plum)]">Open daily 8 AM – 11 PM for short-form sprints or long productions.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Image with Photo Frame */}
              <div className="relative">
                <div className="relative aspect-[4/3]">
                  <div className="relative w-full h-full">
                    <div 
                      className="absolute inset-0 p-8 md:p-12"
                      style={{
                        background: 'linear-gradient(145deg, rgba(61, 35, 80, 0.95) 0%, rgba(45, 25, 60, 0.98) 50%, rgba(61, 35, 80, 0.95) 100%)',
                        boxShadow: `
                          0 20px 60px rgba(0, 0, 0, 0.3),
                          0 8px 16px rgba(0, 0, 0, 0.2),
                          inset 0 1px 0 rgba(255, 255, 255, 0.1),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                        `,
                        border: '1px solid rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.2) 100%)',
                          pointerEvents: 'none'
                        }}
                      ></div>
                      
                      <div 
                        className="absolute inset-4 pointer-events-none z-10"
                        style={{
                          border: '6px solid var(--accent-gold)',
                          opacity: 0.9
                        }}
                      ></div>
                      
                      <div className="absolute inset-4 overflow-hidden" style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.15)' }}>
                        <Image
                          src="/assets/8eb25501-7cc0-4ccf-a906-3a2a747836fd.jpg"
                          alt="R&T Spaces studio - creative workspace"
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/2 via-transparent to-[var(--accent-gold)]/2 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section - Visual Cards */}
        <section 
          ref={valuesRef}
          className={`py-16 md:py-24 lg:py-32 bg-white transition-all duration-700 ${
            valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-4">
                Our Values
              </p>
              <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl lg:text-5xl mb-4">
                The principles that guide everything we do
              </h2>
              <p className="text-lg text-[var(--muted-plum)] max-w-3xl">
                At R&amp;T Spaces, these core values shape every interaction, every booking, and every moment in our studio.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {values.map((value, index) => (
                <article
                  key={value.title}
                  className="border border-[var(--accent)]/20 bg-white p-8 hover:border-[var(--primary)] transition-all duration-300 group shadow-lg"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center rounded-sm group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-300">
                      {value.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-heading text-xl text-[var(--primary)] mb-3 group-hover:underline">
                        {value.title}
                      </h3>
                      <p className="text-base text-[var(--muted-plum)] leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section - Two Column with Image */}
        <section className="py-16 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
                  Our Mission
                </p>
                <h3 className="font-heading text-4xl text-[var(--primary)]">
                  Translate your vision
                </h3>
                <p className="text-lg text-[var(--muted-plum)] leading-relaxed">
                  Whether you need four walls and great light or prefer our crew to jump
                  in, we tailor bookings to your run sheet and deliverables.
                </p>
                <p className="text-base text-[var(--muted-plum)] leading-relaxed">
                  Pick the service that fits your shoot day. Every booking comes with professional support to ensure your session runs smoothly from start to finish.
                </p>
                <Link
                  href="/book-online"
                  className="btn-primary inline-flex"
                >
                  Book Now
                </Link>
              </div>
              <div className="space-y-6">
                <div className="overflow-hidden bg-white shadow-lg">
                  <Image
                    src="/assets/8eb25501-7cc0-4ccf-a906-3a2a747836fd.jpg"
                    alt="Creative direction at R&T Spaces"
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-[360px] w-full object-cover sm:h-[420px]"
                    loading="lazy"
                    quality={85}
                  />
                </div>
                <div className="border border-[var(--lavender)] p-6 bg-white shadow-lg">
                  <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-4">
                    Our services
                  </p>
                  <div className="space-y-5">
                    <div className="border-t border-[var(--lavender)] pt-4">
                      <p className="font-semibold text-[var(--primary)]">Studio Hire</p>
                      <p className="text-sm text-[var(--muted-plum)]">Hourly + daily rates · East London · Equipment included</p>
                    </div>
                    <div className="border-t border-[var(--lavender)] pt-4">
                      <p className="font-semibold text-[var(--primary)]">Creative Session</p>
                      <p className="text-sm text-[var(--muted-plum)]">Resident photographer, tethered capture, direction support</p>
                    </div>
                    <div className="border-t border-[var(--lavender)] pt-4">
                      <p className="font-semibold text-[var(--primary)]">Photobooth Packages</p>
                      <p className="text-sm text-[var(--muted-plum)]">Neon wall, instant prints, on-site host</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Information - Easy to Scan */}
        <section className="py-16 md:py-24 lg:py-32 bg-white border-t border-[var(--lavender)]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-4">
                Get in Touch
              </p>
              <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl">
                Company Information
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3 border-t-2 border-[var(--primary)] pt-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)]">
                  Founded
                </p>
                <p className="text-2xl font-semibold text-[var(--primary)]">
                  {companyInfo.founded}
                </p>
              </div>
              <div className="space-y-3 border-t-2 border-[var(--primary)] pt-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)]">
                  Location
                </p>
                <p className="text-xl font-semibold text-[var(--primary)]">
                  {companyInfo.location}
                </p>
              </div>
              <div className="space-y-3 border-t-2 border-[var(--primary)] pt-6 md:col-span-2 lg:col-span-1">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)]">
                  Address
                </p>
                <p className="text-base text-[var(--muted-plum)] leading-relaxed">
                  {companyInfo.address}
                </p>
              </div>
              <div className="space-y-3 border-t-2 border-[var(--primary)] pt-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)]">
                  Email
                </p>
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="text-lg font-semibold text-[var(--primary)] hover:text-[var(--accent-gold)] transition-colors inline-block"
                >
                  {companyInfo.email}
                </a>
              </div>
              <div className="space-y-3 border-t-2 border-[var(--primary)] pt-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)]">
                  Phone
                </p>
                <a
                  href={`tel:${companyInfo.phone}`}
                  className="text-lg font-semibold text-[var(--primary)] hover:text-[var(--accent-gold)] transition-colors inline-block"
                >
                  {companyInfo.phone}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy & Terms - Accordion Style */}
        <section className="py-16 md:py-24 lg:py-32 bg-white border-t border-[var(--lavender)]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="mb-12">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-4">
                Legal Information
              </p>
              <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl">
                Privacy Policy & Terms
              </h2>
              <p className="text-base text-[var(--muted-plum)] mt-4">
                Click on any section below to view our privacy policy and terms of service.
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Privacy Policy Accordion */}
              <div className="border border-[var(--lavender)] bg-white shadow-lg">
                <button
                  onClick={() => setOpenSection(openSection === 'privacy' ? null : 'privacy')}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[var(--primary)]/5 transition-colors duration-300 group"
                  aria-expanded={openSection === 'privacy'}
                  aria-controls="privacy-content"
                >
                  <h3 className="font-heading text-xl text-[var(--primary)] group-hover:text-[var(--primary)]">
                    Privacy Policy
                  </h3>
                  <svg
                    className={`w-6 h-6 text-[var(--primary)] transition-transform duration-300 ${
                      openSection === 'privacy' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  id="privacy-content"
                  className={`overflow-hidden transition-all duration-300 ${
                    openSection === 'privacy' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 py-6 space-y-6 text-[var(--muted-plum)] border-t border-[var(--lavender)]">
                    <p className="leading-relaxed">
                      At R&amp;T Spaces, we respect your privacy and are committed to
                      protecting your personal data. This privacy policy explains how we
                      collect, use, and safeguard your information.
                    </p>
                    <div className="space-y-3 border-t border-[var(--lavender)] pt-6">
                      <h4 className="font-semibold text-[var(--primary)] text-lg">
                        Information We Collect
                      </h4>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Name and contact information (email, phone number)</li>
                        <li>Booking details and preferences</li>
                        <li>Payment information (processed securely through our payment provider)</li>
                        <li>Communication records</li>
                      </ul>
                    </div>
                    <div className="space-y-3 border-t border-[var(--lavender)] pt-6">
                      <h4 className="font-semibold text-[var(--primary)] text-lg">
                        How We Use Your Information
                      </h4>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>To process and manage your bookings</li>
                        <li>To communicate with you about your sessions</li>
                        <li>To improve our services and customer experience</li>
                        <li>To send you relevant updates (with your consent)</li>
                      </ul>
                    </div>
                    <p className="leading-relaxed border-t border-[var(--lavender)] pt-6">
                      We do not sell or share your personal information with third
                      parties except as necessary to provide our services or as required
                      by law.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms of Service Accordion */}
              <div className="border border-[var(--lavender)] bg-white shadow-lg">
                <button
                  onClick={() => setOpenSection(openSection === 'terms' ? null : 'terms')}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[var(--primary)]/5 transition-colors duration-300 group"
                  aria-expanded={openSection === 'terms'}
                  aria-controls="terms-content"
                >
                  <h3 className="font-heading text-xl text-[var(--primary)] group-hover:text-[var(--primary)]">
                    Terms of Service
                  </h3>
                  <svg
                    className={`w-6 h-6 text-[var(--primary)] transition-transform duration-300 ${
                      openSection === 'terms' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  id="terms-content"
                  className={`overflow-hidden transition-all duration-300 ${
                    openSection === 'terms' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 py-6 space-y-6 text-[var(--muted-plum)] border-t border-[var(--lavender)]">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-[var(--primary)] text-lg">
                        Booking Terms
                      </h4>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Bookings are confirmed upon receipt of deposit payment</li>
                        <li>Cancellations made 48+ hours in advance receive full refund</li>
                        <li>Cancellations within 48 hours are subject to 50% cancellation fee</li>
                        <li>Rescheduling is free when requested 48+ hours in advance</li>
                      </ul>
                    </div>
                    <div className="space-y-3 border-t border-[var(--lavender)] pt-6">
                      <h4 className="font-semibold text-[var(--primary)] text-lg">
                        Studio Usage
                      </h4>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>All equipment must be used responsibly and returned in good condition</li>
                        <li>Any damage to equipment or studio space will be charged at replacement/repair cost</li>
                        <li>Studio must be left in the same condition as found</li>
                        <li>Smoking is not permitted in the studio</li>
                      </ul>
                    </div>
                    <div className="space-y-3 border-t border-[var(--lavender)] pt-6">
                      <h4 className="font-semibold text-[var(--primary)] text-lg">
                        Liability
                      </h4>
                      <p className="leading-relaxed">
                        R&amp;T Spaces is not liable for any loss or damage to personal
                        property brought into the studio. Clients are responsible for
                        their own equipment and belongings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--lavender)]">
              <p className="text-sm text-[var(--muted-plum)]">
                Last updated: January 2025. For questions about our privacy policy
                or terms, please contact us at{" "}
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="text-[var(--primary)] hover:text-[var(--accent-gold)] transition-colors font-semibold"
                >
                  {companyInfo.email}
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section - Matching Homepage Style */}
        <section 
          className="relative py-16 md:py-24 lg:py-32 overflow-hidden"
          style={{
            backgroundColor: 'var(--hero-background)'
          }}
        >
          <GradientBars colors={['var(--primary)', 'transparent']} />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16 items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.5em] text-[var(--primary)]">
                  Ready when you are
                </p>
                <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl lg:text-5xl">
                  Ready to Work With Us?
                </h2>
                <h3 className="font-heading text-2xl sm:text-3xl text-[var(--primary)]">
                  Book your studio session today and experience the R&amp;T Spaces
                  <span className="text-[var(--accent-gold)]"> difference</span>
                </h3>
                <p className="text-lg text-[var(--primary)] leading-relaxed">
                  Choose your package and book your studio session today. All
                  equipment is included and ready before your call time.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/book-online" className="btn-primary w-full text-center">
                  Book Now
                </Link>
                <Link href="/contact" className="btn-cta w-full text-center">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
