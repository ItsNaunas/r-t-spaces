import {
  AboutUsSection,
  ContactSection,
  EmailSubscriptionSection,
  HowItWorksSection,
  SiteFooter,
  StudioFeaturesSection,
  StudioHeroStats,
} from "@/components/StudioSections";
import { HeroSection } from "@/components/HeroSection";
import { StatsStrip, OfferForkSection, GalleryTeaserSection } from "@/components/HomeSections";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "PhotographyBusiness",
  name: "RT Spaces",
  description:
    "Photography studio hire in East London. A fully-equipped 5m x 5m studio with professional lighting, backdrops and kit included, from £55/hour, or a session shot for you.",
  url: "https://www.rtspaces.co.uk",
  telephone: "+447944667000",
  email: "enquires@rtspaces.co.uk",
  image: "https://www.rtspaces.co.uk/assets/logo/social.png",
  priceRange: "££",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Unit 3E, 736-740 Romford Road",
    addressLocality: "London",
    postalCode: "E12 6BT",
    addressCountry: "GB",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:00",
    closes: "23:00",
  },
  sameAs: ["https://www.instagram.com/rtspaces/", "https://www.tiktok.com/@rtspaces"],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <HeroSection />
      <StatsStrip />
      <main id="main-content" className="w-full">
        <StudioHeroStats />
        <OfferForkSection />
        <StudioFeaturesSection />
        <HowItWorksSection />
        <GalleryTeaserSection />
        {/* TestimonialSection removed until real client reviews replace the placeholder/stock ones */}
        <AboutUsSection />
        <ContactSection />
        <EmailSubscriptionSection />
      </main>
      <SiteFooter />
    </>
  );
}
