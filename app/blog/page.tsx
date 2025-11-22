import { SiteFooter } from "@/components/StudioSections";

export default function BlogPage() {
  return (
    <div className="bg-[var(--primary)]">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-12 sm:gap-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            Blog
          </p>
          <h1 className="font-heading text-4xl text-black sm:text-5xl">
            Blog
          </h1>
          <p className="max-w-3xl text-lg text-zinc-600">
            Coming soon - Stay tuned for studio tips, creative insights, and behind-the-scenes content.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

