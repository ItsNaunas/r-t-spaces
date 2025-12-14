import {
  AboutUsSection,
  ContactSection,
  EmailSubscriptionSection,
  HowItWorksSection,
  SiteFooter,
  StudioFeaturesSection,
  StudioHeroStats,
  TestimonialSection,
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
        <TestimonialSection />
        <AboutUsSection />
        <ContactSection />
        <EmailSubscriptionSection />
      </main>
      <SiteFooter />
    </>
  );
}
