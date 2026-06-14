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

export default function Home() {
  return (
    <>
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
