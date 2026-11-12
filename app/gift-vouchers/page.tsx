import type { Metadata } from "next";
import { SiteFooter } from "@/components/StudioSections";
import { GradientBars } from "@/components/ui/gradient-bars";
import { VOUCHER_AMOUNTS, VOUCHER_MAX, VOUCHER_MIN } from "@/lib/vouchers";
import { VoucherForm } from "./VoucherForm";

export const metadata: Metadata = {
  title: "Gift Vouchers | RT Spaces",
  description: "Give studio time. RT Spaces gift vouchers for photo and video sessions in East London, valid for 12 months.",
};

const points = [
  "Emailed instantly, to you or straight to them",
  "Works on any studio hire or photo session",
  "Use it across more than one booking: what's left stays on the code",
  "Valid for 12 months",
];

export default function GiftVouchersPage() {
  return (
    <div className="bg-[var(--base)]">
      <section
        className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20"
        style={{ backgroundColor: "var(--hero-background)" }}
      >
        <GradientBars colors={["var(--primary)", "transparent"]} />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.4em] text-[var(--primary)]/80">Gift Vouchers</p>
            <h1 className="font-heading text-4xl leading-tight text-[var(--primary)] sm:text-5xl lg:text-6xl">
              Give studio time
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[var(--primary)]/90">
              A gift for the photographer, creator or content-maker in your life. They choose the date and the
              session.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto grid gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-[var(--primary)]">How it works</h2>
            <ul className="mt-6 space-y-3 text-[var(--muted-plum)]">
              {points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span aria-hidden className="text-[var(--primary)]">✓</span>
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-[var(--muted-plum)]">
              To use a voucher, book online and enter the code in the discount box. Questions? Email
              enquires@rtspaces.co.uk.
            </p>
          </div>
          <VoucherForm amounts={VOUCHER_AMOUNTS} min={VOUCHER_MIN} max={VOUCHER_MAX} />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
