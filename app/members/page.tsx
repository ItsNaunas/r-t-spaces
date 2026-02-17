"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/StudioSections";
import { GradientBars } from "@/components/ui/gradient-bars";
import { BOOKING_PACKAGES } from "@/lib/pricing";

const MAIN_PACKAGE_IDS = ["essential-studio", "signature-studio", "luxury-studio"];
const mainPackages = BOOKING_PACKAGES.filter((p) => MAIN_PACKAGE_IDS.includes(p.id));

const MEMBERSHIP_TIERS = [
  {
    id: "essentials",
    title: "Essentials Off Peak",
    price: 120,
    priceLabel: "£120",
    period: "pcm",
    description:
      "Perfect for individuals looking for flexible access to our fully equipped studio, with member rates on off-peak hire.",
    benefits: [
      "Reduced rates on off-peak studio hire (Mon–Thu, 9am–5pm)",
      "Access to our online booking system",
      "Member-only updates and offers",
      "Priority support when you book",
    ],
    popular: false,
    image: "/assets/gallery/0597e892-11ea-4d66-858d-c956f9f6fc6e.jpg",
    imageAlt: "Creative session and tethered capture at RT Spaces",
  },
  {
    id: "signature",
    title: "Signature Flex",
    price: 250,
    priceLabel: "£250",
    period: "pcm",
    description:
      "Our most popular membership for professionals and creatives who need frequent, flexible studio access at member rates.",
    benefits: [
      "All Essentials benefits, plus:",
      "Reduced rates on all studio hire (any day, any time)",
      "Discount on session packages and add-ons",
      "Priority booking for peak times",
      "Dedicated support for regular members",
    ],
    popular: true,
    image: "/assets/gallery/919177f2-e71e-4881-90d0-b0eef3b4ccfc.jpg",
    imageAlt: "Professional studio space with cyclorama at RT Spaces",
  },
];

function MembershipTierCard({
  tier,
  onJoinNow,
  isSubmitting,
}: {
  tier: (typeof MEMBERSHIP_TIERS)[number];
  onJoinNow: (tierId: string) => void;
  isSubmitting: boolean;
}) {
  return (
    <section
      id={tier.id}
      className="relative overflow-hidden border-y border-[var(--accent)]/20 bg-[var(--base)]"
    >
      <div className="absolute inset-0 opacity-[0.03]">
        <GradientBars colors={["var(--primary)", "transparent"]} />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="relative aspect-[4/3] min-h-[240px] overflow-hidden rounded-sm border border-[var(--accent)]/20">
            <Image
              src={tier.image}
              alt={tier.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority={false}
            />
          </div>

          <div className="space-y-8">
            {tier.popular && (
              <span className="inline-block bg-[var(--primary)] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                Most popular
              </span>
            )}
            <div>
              <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl lg:text-5xl">
                {tier.title}
              </h2>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-heading text-4xl font-semibold text-[var(--primary)]">
                  {tier.priceLabel}
                </span>
                <span className="text-lg text-[var(--muted-plum)]">
                  {tier.period}
                </span>
              </div>
            </div>
            <p className="text-lg text-[var(--muted-plum)] leading-relaxed">
              {tier.description}
            </p>
            <ul className="space-y-3">
              {tier.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-[var(--primary)] mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-base text-[var(--muted-plum)] leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onJoinNow(tier.id)}
              disabled={isSubmitting}
              className="btn-primary inline-flex w-full sm:w-auto justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Taking you to checkout…" : "Join now"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MembersPage() {
  const [submittingTierId, setSubmittingTierId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true" && params.get("session_id")) {
      setShowSuccess(true);
      window.history.replaceState({}, "", "/members");
    }
    if (params.get("cancelled") === "true") {
      setShowCancelled(true);
      window.history.replaceState({}, "", "/members");
    }
  }, []);

  const handleJoinNow = async (tierId: string) => {
    setSubmittingTierId(tierId);
    try {
      const res = await fetch("/api/checkout/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL received");
    } catch (err) {
      console.error(err);
      setSubmittingTierId(null);
      alert(
        err instanceof Error ? err.message : "Unable to start checkout. Please try again or contact enquires@rtspaces.co.uk."
      );
    }
  };

  return (
    <div className="bg-[var(--base)]">
      {showSuccess && (
        <div className="bg-[var(--primary)] text-white px-4 py-4 text-center">
          <p className="font-heading text-lg">
            Thank you for joining. Welcome to the circle.
          </p>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            className="mt-2 text-sm underline underline-offset-2 opacity-90 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {showCancelled && (
        <div className="bg-[var(--accent)]/10 border-b border-[var(--accent)]/20 px-4 py-3 text-center text-[var(--muted-plum)]">
          <p>Checkout was cancelled. You can try again whenever you’re ready.</p>
          <button
            type="button"
            onClick={() => setShowCancelled(false)}
            className="mt-1 text-sm text-[var(--primary)] underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero */}
      <section
        id="main-content"
        className="relative flex min-h-[50vh] w-full flex-col items-center justify-center overflow-hidden pt-24 pb-16"
        style={{ backgroundColor: "var(--hero-background)" }}
      >
        <div className="absolute inset-0 w-full h-full">
          <GradientBars colors={["var(--primary)", "transparent"]} />
        </div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--primary)]/80">
              Memberships
            </p>
            <h1 className="font-heading text-4xl text-[var(--primary)] sm:text-5xl lg:text-6xl leading-tight mt-4">
              Join as a member
            </h1>
            <p className="mt-6 text-lg text-[var(--primary)]/90 sm:text-xl leading-relaxed max-w-2xl mx-auto">
              Membership gives you access to reduced rates on studio hire, session
              packages, and priority booking. Choose the tier that fits how you
              work—monthly billing, cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Membership tiers */}
      <div className="divide-y divide-[var(--accent)]/20">
        {MEMBERSHIP_TIERS.map((tier) => (
          <MembershipTierCard
            key={tier.id}
            tier={tier}
            onJoinNow={handleJoinNow}
            isSubmitting={submittingTierId !== null}
          />
        ))}
      </div>

      {/* More from RT Spaces - studio booking options */}
      <section className="border-t border-[var(--lavender)] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
              Book a session
            </p>
            <h2 className="font-heading text-3xl text-[var(--primary)] sm:text-4xl mt-2">
              More from RT Spaces
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-[var(--muted-plum)]">
              Session packages and studio hire—member rates apply when you book
              with your member email.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {mainPackages.slice(0, 3).map((pkg) => (
              <article
                key={pkg.id}
                className="flex flex-col border-2 border-[var(--accent)]/20 bg-[var(--base)] p-6 transition-all duration-300 hover:border-[var(--primary)] hover:shadow-md"
              >
                <h3 className="font-heading text-xl text-[var(--primary)] mb-2">
                  {pkg.title}
                </h3>
                <p className="text-sm text-[var(--muted-plum)] mb-4 flex-grow">
                  {pkg.duration}
                </p>
                <p className="font-heading text-2xl text-[var(--primary)] mb-4">
                  £{pkg.price}
                </p>
                <Link
                  href={`/?package=${encodeURIComponent(pkg.title)}#contact`}
                  className="btn-secondary w-full text-center"
                >
                  Book now
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12 pt-12 border-t border-[var(--lavender)]">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/services"
                className="text-[var(--primary)] font-medium underline underline-offset-4 hover:opacity-80"
              >
                View all packages & pricing
              </Link>
              <span className="text-[var(--muted-plum)] hidden sm:inline">
                ·
              </span>
              <Link href="/#contact" className="btn-primary">
                Book online
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
