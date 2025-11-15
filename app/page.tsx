import {
  FinalCtaSection,
  FeaturedWorkSection,
  GallerySection,
  MissionSection,
  SiteFooter,
  StorySection,
} from "@/components/StudioSections";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  return (
    <div className="bg-white">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-12 sm:gap-16 sm:px-6 lg:px-8">
        <HeroSection />
        <StorySection />
        <MissionSection />
        <FeaturedWorkSection />
        <GallerySection />
        <FinalCtaSection />
        <SiteFooter />
      </main>
    </div>
  );
}
