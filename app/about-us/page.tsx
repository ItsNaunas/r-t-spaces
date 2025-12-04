import Link from "next/link";
import { SiteFooter, StorySection, MissionSection } from "@/components/StudioSections";

const companyInfo = {
  name: "R&T Spaces",
  founded: "2024",
  location: "East London",
  address: "Unit 3E, 736-740 Romford Road, London E12 6BT",
  email: "Teddy77723@gmail.com",
  phone: "07944667000",
};

const values = [
  {
    title: "Creativity First",
    description:
      "We believe in providing spaces that inspire and enable creative expression without limitations.",
  },
  {
    title: "Professional Excellence",
    description:
      "Every detail is considered, from equipment prep to studio cleanliness, ensuring a professional experience.",
  },
  {
    title: "Community Focus",
    description:
      "We're building a community of creators, photographers, and brands who value quality and collaboration.",
  },
  {
    title: "Accessibility",
    description:
      "Flexible booking options and transparent pricing make professional studio space accessible to all creators.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="bg-[var(--base)]">
      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
            About Us
          </p>
          <h1 className="font-heading text-4xl text-[var(--accent)] sm:text-5xl lg:text-6xl">
            About R&amp;T Spaces
          </h1>
          <p className="max-w-3xl text-lg text-[var(--accent)]/80">
            A home for creators, brand launches, and portrait sessions in East
            London. Founded by Rose &amp; Teddy, R&amp;T Spaces pairs a calming
            studio with ready-to-roll equipment so you can focus on creating.
          </p>
        </section>

        {/* Story Section */}
        <StorySection />

        {/* Mission Section */}
        <MissionSection />

        {/* Company Information */}
        <section className="space-y-8 border-t border-[var(--accent)]/20 pt-12">
          <h2 className="font-heading text-3xl text-[var(--accent)] sm:text-4xl">
            Company Information
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60">
                Founded
              </p>
              <p className="text-lg font-semibold text-[var(--accent)]">
                {companyInfo.founded}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60">
                Location
              </p>
              <p className="text-lg font-semibold text-[var(--accent)]">
                {companyInfo.location}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60">
                Address
              </p>
              <p className="text-base text-[var(--accent)]/80">
                {companyInfo.address}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60">
                Email
              </p>
              <a
                href={`mailto:${companyInfo.email}`}
                className="text-base text-[var(--accent)] hover:text-[var(--primary)] transition-colors"
              >
                {companyInfo.email}
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60">
                Phone
              </p>
              <a
                href={`tel:${companyInfo.phone}`}
                className="text-base text-[var(--accent)] hover:text-[var(--primary)] transition-colors"
              >
                {companyInfo.phone}
              </a>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="space-y-8 border-t border-[var(--accent)]/20 pt-12">
          <div>
            <h2 className="font-heading text-3xl text-[var(--accent)] sm:text-4xl mb-4">
              Our Values
            </h2>
            <p className="text-lg text-[var(--accent)]/80 max-w-3xl">
              The principles that guide everything we do at R&amp;T Spaces.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value) => (
              <article
                key={value.title}
                className="border border-[var(--accent)]/20 p-6 space-y-3"
              >
                <h3 className="font-heading text-xl text-[var(--accent)]">
                  {value.title}
                </h3>
                <p className="text-[var(--accent)]/80">{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Privacy Policy & Terms */}
        <section className="space-y-8 border-t border-[var(--accent)]/20 pt-12">
          <h2 className="font-heading text-3xl text-[var(--accent)] sm:text-4xl">
            Privacy Policy & Terms
          </h2>
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-heading text-2xl text-[var(--accent)]">
                Privacy Policy
              </h3>
              <div className="space-y-4 text-[var(--accent)]/80">
                <p>
                  At R&amp;T Spaces, we respect your privacy and are committed to
                  protecting your personal data. This privacy policy explains how we
                  collect, use, and safeguard your information.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-[var(--accent)]">
                    Information We Collect
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name and contact information (email, phone number)</li>
                    <li>Booking details and preferences</li>
                    <li>Payment information (processed securely through our payment provider)</li>
                    <li>Communication records</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-[var(--accent)]">
                    How We Use Your Information
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>To process and manage your bookings</li>
                    <li>To communicate with you about your sessions</li>
                    <li>To improve our services and customer experience</li>
                    <li>To send you relevant updates (with your consent)</li>
                  </ul>
                </div>
                <p>
                  We do not sell or share your personal information with third
                  parties except as necessary to provide our services or as required
                  by law.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-[var(--accent)]/20 pt-8">
              <h3 className="font-heading text-2xl text-[var(--accent)]">
                Terms of Service
              </h3>
              <div className="space-y-4 text-[var(--accent)]/80">
                <div className="space-y-2">
                  <h4 className="font-semibold text-[var(--accent)]">
                    Booking Terms
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      Bookings are confirmed upon receipt of deposit payment
                    </li>
                    <li>
                      Cancellations made 48+ hours in advance receive full refund
                    </li>
                    <li>
                      Cancellations within 48 hours are subject to 50% cancellation
                      fee
                    </li>
                    <li>Rescheduling is free when requested 48+ hours in advance</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-[var(--accent)]">
                    Studio Usage
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      All equipment must be used responsibly and returned in good
                      condition
                    </li>
                    <li>
                      Any damage to equipment or studio space will be charged at
                      replacement/repair cost
                    </li>
                    <li>
                      Studio must be left in the same condition as found
                    </li>
                    <li>
                      Smoking is not permitted in the studio
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-[var(--accent)]">
                    Liability
                  </h4>
                  <p>
                    R&amp;T Spaces is not liable for any loss or damage to personal
                    property brought into the studio. Clients are responsible for
                    their own equipment and belongings.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <p className="text-sm text-[var(--accent)]/60">
                Last updated: January 2025. For questions about our privacy policy
                or terms, please contact us at{" "}
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
                >
                  {companyInfo.email}
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 border-t border-[var(--accent)]/20 pt-12">
          <h2 className="font-heading text-3xl text-[var(--accent)]">
            Ready to Work With Us?
          </h2>
          <p className="text-lg text-[var(--accent)]/80 max-w-2xl mx-auto">
            Book your studio session today and experience the R&amp;T Spaces
            difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-online" className="btn-primary">
              Book Now
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

