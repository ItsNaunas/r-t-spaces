import type { Metadata } from "next";
import { SiteFooter } from "@/components/StudioSections";

export const metadata: Metadata = {
  title: "Blog — RT Spaces",
  description: "Studio tips, creative insights, and behind-the-scenes content from RT Spaces photography studio in East London.",
};

export default function BlogPage() {
  return (
    <div className="bg-[var(--base)]">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-12 sm:gap-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
            Blog
          </p>
          <h1 className="font-heading text-5xl text-[var(--primary)] sm:text-6xl lg:text-7xl">
            Blog
          </h1>
          <p className="max-w-3xl text-lg text-[var(--muted-plum)]">
            Coming soon - Stay tuned for studio tips, creative insights, and behind-the-scenes content.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

