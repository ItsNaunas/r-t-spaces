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

export default function Home() {
  return (
    <>
      <HeroSection />
      <main id="main-content" className="w-full">
        <StudioHeroStats />
        <StudioFeaturesSection />
        <HowItWorksSection />
        {/* TestimonialSection removed until real client reviews replace the placeholder/stock ones */}
        <AboutUsSection />
        <ContactSection />
        <EmailSubscriptionSection />
      </main>
      <SiteFooter />
    </>
  );
}
