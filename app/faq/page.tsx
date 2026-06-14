import { FinalCtaSection, SiteFooter } from "@/components/StudioSections";
import { GradientBars } from "@/components/ui/gradient-bars";

const faqs = [
  {
    question: "What are your opening hours?",
    answer: "We are open daily from 8 AM to 11 PM. Extended hours are available on request.",
  },
  {
    question: "Where is the studio located?",
    answer: "Unit 3E, 736-740 Romford Road, London E12 6BT. On-site parking is available after 6 PM, and Stratford station is about 12 minutes away by bus.",
  },
  {
    question: "What equipment is included?",
    answer: "Continuous LEDs, strobes, stands, modifiers, a tethering table, and a rolling wardrobe rack, plus a white cyclorama and styled corners. There's also a dressing area, steamer and Bluetooth audio.",
  },
  {
    question: "Can I bring my own crew?",
    answer: "Yes. You can bring your own photographer and crew and run the shoot yourself, or book a session and we'll shoot it for you.",
  },
  {
    question: "How do I book?",
    answer: "Book right here on the site: choose studio hire or a session, pick a time, and pay your deposit online in a couple of minutes. Prefer to talk first? Email enquires@rtspaces.co.uk or call 07944667000.",
  },
  {
    question: "What's the deposit and cancellation policy?",
    answer: "A 50% non-refundable deposit secures your booking, with the balance due before your session. Cancel 48 hours or more before and any balance you've paid is refunded; within 48 hours is non-refundable.",
  },
];

export default function FAQPage() {
  return (
    <div className="bg-[var(--base)]">
      {/* Hero band */}
      <section
        className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20"
        style={{ backgroundColor: "var(--hero-background)" }}
      >
        <GradientBars colors={["var(--primary)", "transparent"]} />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.4em] text-[var(--primary)]/80">
              FAQ
            </p>
            <h1 className="font-heading text-4xl leading-tight text-[var(--primary)] sm:text-5xl lg:text-6xl">
              Frequently asked questions
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[var(--primary)]/90">
              Everything you need to know about hiring the studio, what&apos;s included,
              and how booking works.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ list */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8"
              >
                <h2 className="font-heading text-xl font-semibold text-[var(--primary)] sm:text-2xl">
                  {faq.question}
                </h2>
                <p className="mt-3 leading-relaxed text-[var(--muted-plum)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCtaSection />
      <SiteFooter />
    </div>
  );
}
