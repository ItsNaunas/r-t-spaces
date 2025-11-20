import { SiteFooter } from "@/components/StudioSections";

const faqs = [
  {
    question: "What are your opening hours?",
    answer: "We are open daily from 8 AM to 11 PM.",
  },
  {
    question: "Where is the studio located?",
    answer: "Unit 3E, 736-740 Romford Road, London E12 6BT",
  },
  {
    question: "What equipment is included?",
    answer: "Our studio includes continuous LEDs, strobes, stands, modifiers, tethering table, and rolling wardrobe rack. We also have a dressing area, steamer, and Bluetooth audio.",
  },
  {
    question: "Can I bring my own crew?",
    answer: "Yes, absolutely! You can bring in your own crew, or we can provide our resident team for tethered shoots and photobooth add-ons.",
  },
  {
    question: "How do I book?",
    answer: "You can book by contacting us at Teddy77723@gmail.com or calling 07944667000. We offer both hourly and daily rates.",
  },
];

export default function FAQPage() {
  return (
    <div className="bg-white">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-12 sm:gap-16 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            FAQ
          </p>
          <h1 className="font-heading text-4xl text-black sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <div className="mt-12 space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-3 border-b border-zinc-200 pb-8">
                <h2 className="font-heading text-2xl font-semibold text-black">
                  {faq.question}
                </h2>
                <p className="text-lg text-zinc-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

