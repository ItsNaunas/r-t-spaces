"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SiteFooter, FinalCtaSection } from "@/components/StudioSections";
import { BookNowButton } from "@/components/booking/BookNowButton";
import { GradientBars } from "@/components/ui/gradient-bars";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

const equipmentCategories = [
  {
    title: "Lighting Equipment",
    description: "Professional lighting solutions for every creative need",
    items: [
      {
        name: "Professional Softboxes",
        description: "High-end softboxes for soft, even illumination",
        image: "/assets/equipment/IMG_8064.PNG",
      },
      {
        name: "Continuous LEDs",
        description: "Professional LED panels for video work and continuous lighting",
        image: "/assets/equipment/IMG_8065.PNG",
      },
      {
        name: "Strobes & Modifiers",
        description: "Studio strobes with various modifiers and reflectors",
        image: "/assets/equipment/33e978bc-6077-4c5d-9f38-9d23945f3353.jpg",
      },
      {
        name: "Diffusers & Reflectors",
        description: "Complete set of diffusers and reflectors for precise light control",
        image: "/assets/equipment/f8c6e9ae-3bde-4eb0-a641-4d937ede8ef1.jpg",
      },
    ],
  },
  {
    title: "Studio Equipment",
    description: "Essential tools and amenities for seamless production",
    items: [
      {
        name: "Light Stands & Grip",
        description: "Professional light stands and grip equipment",
        image: "/assets/equipment/772b9e7a-95cf-4571-bd3c-32ea448e8743.jpg",
      },
      {
        name: "Tethering Station",
        description: "Dedicated tethering setup for immediate review",
        image: "/assets/equipment/13bad677-2b14-47e9-9797-3bd7cd6b030a.jpg",
      },
      {
        name: "Rolling Wardrobe Rack",
        description: "Mobile wardrobe rack for easy outfit changes",
        image: "/assets/equipment/IMG_7860.JPG",
      },
      {
        name: "Steamer",
        description: "Professional garment steamer for wrinkle-free looks",
        image: "/assets/equipment/IMG_7857.JPG",
      },
    ],
  },
  {
    title: "Backdrops",
    description: "Versatile backdrop options for any creative vision",
    items: [
      {
        name: "White Cyclorama",
        description: "Seamless white cyclorama for clean commercial shots",
        image: "/assets/equipment/242d43f4-d4c0-4ade-b950-5a04b012071b.jpg",
      },
      {
        name: "Textured Grey",
        description: "Textured grey backdrop for editorial depth",
        image: "/assets/equipment/3f4d65d6-7a25-44cc-a4f4-a1ded7995f3a.jpg",
      },
      {
        name: "Colour Rolls",
        description: "Curated collection of coloured backdrop rolls",
        image: "/assets/equipment/778a9017-2de1-4356-9b68-319676e1ca7d.jpg",
      },
      {
        name: "Lifestyle Setups",
        description: "Styled lounge corners and lifestyle setups",
        image: "/assets/equipment/841f2228-3c39-4fed-9332-ae597017fca7.jpg",
      },
    ],
  },
  {
    title: "Props & Styling",
    description: "Curated props and styling elements to elevate your shoot",
    items: [
      {
        name: "Stools & Plinths",
        description: "Minimalist stools and plinths for product and portrait work",
        image: "/assets/equipment/846c0cf7-12e1-4b08-97e2-757b380dee98.jpg",
      },
      {
        name: "Furniture Pieces",
        description: "Curated furniture for styled lifestyle shots",
        image: "/assets/equipment/IMG_7861.JPG",
      },
      {
        name: "Neon Photo Booth Wall",
        description: "Brandable neon wall with custom wraps for events",
        image: "/assets/gallery/5F978C66-0CA5-46F1-8156-3E610244CDD4.jpg",
      },
      {
        name: "Styling Accessories",
        description: "Various styling accessories and decorative elements",
        image: "/assets/equipment/IMG_7863.PNG",
      },
    ],
  },
];

function EquipmentTabs() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Tab Navigation */}
        <div className="mb-10 md:mb-14">
          <div className="border-b-2 border-[var(--lavender)]">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {equipmentCategories.map((category, index) => (
                <button
                  key={category.title}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-all duration-300 whitespace-nowrap border-b-2 ${
                    activeTab === index
                      ? "text-[var(--primary)] font-semibold border-[var(--primary)] -mb-[2px]"
                      : "text-[var(--muted-plum)] hover:text-[var(--primary)] border-transparent"
                  }`}
                  aria-selected={activeTab === index}
                  role="tab"
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Panels */}
        <div className="relative min-h-[500px]">
          {equipmentCategories.map((category, categoryIndex) => (
            <div
              key={category.title}
              role="tabpanel"
              className={`transition-opacity duration-500 ease-in-out ${
                activeTab === categoryIndex ? "opacity-100 block" : "opacity-0 hidden"
              }`}
            >
              {/* Category Header */}
              <div className="mb-10 md:mb-14 text-center max-w-3xl mx-auto">
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[var(--primary)] mb-4">
                  {category.title}
                </h2>
                <p className="text-base md:text-lg text-[var(--muted-plum)] leading-relaxed">
                  {category.description}
                </p>
              </div>

              {/* Equipment Grid */}
              <div className="grid gap-8 md:gap-10 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item, itemIndex) => (
                  <article
                    key={item.name}
                    className="group bg-white border border-[var(--lavender)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg overflow-hidden"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--background)]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading={activeTab === categoryIndex && itemIndex < 3 ? "eager" : "lazy"}
                        quality={85}
                      />
                      {/* Subtle overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 md:p-6 flex flex-col">
                      <h3 className="font-heading text-lg md:text-xl font-semibold text-[var(--primary)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm md:text-base text-[var(--muted-plum)] leading-relaxed mb-4 flex-grow">
                        {item.description}
                      </p>
                      <BookNowButton className="btn-primary text-center mt-auto">
                        Check Availability
                      </BookNowButton>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function EquipmentPage() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();

  return (
    <div className="bg-[var(--base)]">
      {/* Hero Section - Simplified and More Focused */}
      <section 
        className="relative min-h-[50vh] -mt-[73px] pt-[73px] pb-12 md:pb-16 lg:pb-20"
        style={{ backgroundColor: 'var(--hero-background)' }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <GradientBars colors={['var(--primary)', 'transparent']} />
        </div>
        
        <div 
          ref={heroRef}
          className={`relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 transition-all duration-700 ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--primary)] mb-4">
              Equipment & Backdrops
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6 text-[var(--primary)]">
              Complete Studio Equipment
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-4 text-[var(--primary)] font-light">
              <span>Ready for Your Vision</span>
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--gold)' }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm md:text-base font-light text-[var(--primary)]">
                100% Equipment Included
              </span>
            </div>

            <p className="text-base md:text-lg mb-8 leading-relaxed text-[var(--primary)] max-w-2xl mx-auto">
              Every piece of equipment you need for a successful shoot is included in your booking. 
              All equipment is prepped before your call time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <BookNowButton className="btn-primary group">
                <span className="flex items-center gap-2">
                  Book Studio
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </BookNowButton>
              <Link 
                href="#main-content"
                className="group inline-flex items-center justify-center border border-white bg-white px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-medium text-[var(--primary)] transition-all duration-300 hover:bg-white/90 hover:text-[var(--primary)] hover:scale-[1.02] hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  View Equipment
                  <svg 
                    className="w-5 h-5 transition-transform group-hover:translate-y-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="w-full relative z-10">
        {/* Equipment Categories - Tabbed Interface */}
        <EquipmentTabs />

        {/* Additional Info Section - Matching Homepage Style */}
        <section 
          className="relative py-16 md:py-24 lg:py-32 overflow-hidden"
          style={{
            backgroundColor: 'var(--hero-background)'
          }}
        >
          <GradientBars colors={['var(--primary)', 'transparent']} />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--primary)]">
                  All Included
                </p>
                <h3 className="font-heading text-3xl sm:text-4xl text-[var(--primary)]">
                  Every Piece Prepped Before Your Arrival
                </h3>
                <p className="text-lg text-[var(--primary)] leading-relaxed">
                  Every piece of equipment listed is included in your studio hire at no additional cost. 
                  Our team preps everything before your call time so you can focus on creating.
                </p>
                <ul className="space-y-4 text-[var(--primary)]">
                  {[
                    "All equipment prepped before your arrival",
                    "Professional lighting setup included",
                    "Multiple backdrop options available",
                    "On-call support for equipment questions",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="h-6 w-6 text-[var(--primary)] mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--primary)]">
                  Need Something Specific?
                </p>
                <h3 className="font-heading text-3xl sm:text-4xl text-[var(--primary)]">
                  We&apos;re Here to Help
                </h3>
                <p className="text-lg text-[var(--primary)] leading-relaxed">
                  Have a specific piece of equipment in mind? Let us know when you book and we&apos;ll 
                  confirm availability or suggest alternatives. Our team is always ready to accommodate 
                  your creative needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <BookNowButton className="btn-primary">
                    Book Now
                  </BookNowButton>
                  <Link 
                    href="/#contact" 
                    className="group inline-flex items-center justify-center border border-white bg-white px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-medium text-[var(--primary)] transition-all duration-300 hover:bg-white/90 hover:text-[var(--primary)] hover:scale-[1.02] hover:shadow-lg"
                  >
                    Ask About Equipment
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FinalCtaSection />
      </main>
      <div className="relative z-20">
        <SiteFooter />
      </div>
    </div>
  );
}


