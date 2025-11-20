import {
  EmailSubscriptionSection,
  HowItWorksSection,
  SiteFooter,
  StudioFeaturesSection,
  StudioPreviewsGrid,
  TestimonialSection,
} from "@/components/StudioSections";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <main id="main-content" className="w-full bg-[var(--base)]">
        <StudioPreviewsGrid />
        <StudioFeaturesSection />
        <HowItWorksSection />
        <TestimonialSection />
        <EmailSubscriptionSection />
      </main>
      <SiteFooter />
    </>
  );
}
