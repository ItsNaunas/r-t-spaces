import {
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
      <main id="main-content" className="w-full bg-[var(--base)]">
        <StudioHeroStats />
        <StudioFeaturesSection />
        <HowItWorksSection />
        <TestimonialSection />
        <EmailSubscriptionSection />
      </main>
      <SiteFooter />
    </>
  );
}
