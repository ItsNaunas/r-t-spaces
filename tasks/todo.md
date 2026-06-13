# RT Spaces — Master plan (fixes + "evolve it" redesign)

Tracked in 3 places: **this file** (the actionable checklist), the cross-session note in
Claude memory (`rt-spaces-redesign.md`), and the full audit detail in chat. This file is the
source of truth for what's left.

Direction: **"evolve it"** — keep the plum/lavender/gold soft-luxury brand, make it cleaner,
accessible, editorial. Approach: audit-first (done) → foundation → pages. All build work lands
on `feature/booking-wizard` (or a fresh branch); production is only touched on a deliberate launch.

---

## ✅ Done

**Shipped to production (master, commit fb424a5):**
- [x] Booking persistence moved fs → Upstash Redis (fixed the serverless bug: no confirmation
  emails + failing webhook). Live UI unchanged.

**Built, on `feature/booking-wizard` (NOT launched yet):**
- [x] Guided booking drawer-wizard (offer fork → option+extras → date/time → pay), opens from
  every CTA via `BookNowButton`; old monolith `BookingForm` deleted; `/book-online` inline.
- [x] Dead-code cleanup (StudioSections 1866→~1250); docs moved to `docs/` + secrets scrubbed.
- [x] Newsletter wired to Resend; fake stats normalised (4.9 / 200+, dropped "24/7").
- [x] Apple/Google Pay/Link enabled in checkout route (card-only removed).

---

## 🔲 Your manual to-dos (off-code)
- [ ] Confirm the Vercel production deploy of `fb424a5` went green
- [ ] Reveal the Stripe webhook `whsec_…` and confirm it matches `STRIPE_WEBHOOK_SECRET` in Vercel
- [ ] **Rotate the Resend API key** (leaked in git history); rotate the test Stripe key too
- [ ] Enable **Link** in Stripe payment methods
- [ ] (Optional) one real booking + self-refund to prove the confirmation email now fires
- [ ] Decide when to launch the redesign branch to production

---

## 🔲 Sprint 0 — trust + quick wins (low risk, do next)
- [ ] Resolve **pricing/policy contradictions**: deposit described 3 ways (50% / non-refundable /
  £20 fixed) across `lib/pricing.ts`, `app/book-online`, `app/services`; Members "cancel anytime"
  vs "3-month minimum" (`app/members/page.tsx`). Pick one consistent story.
- [ ] Scope the **Calendly script** to the booking flow only (currently global in `app/layout.tsx`,
  render-blocking on every page)
- [ ] Add `app/sitemap.ts` + `app/robots.ts` (allow all, disallow /admin /api, point to sitemap)
- [ ] Add **LocalBusiness/PhotographyBusiness JSON-LD** (homepage/layout) + **FAQPage JSON-LD** (faq)
- [ ] Add `metadataBase` for absolute canonical/OG URLs
- [ ] Compress the referenced 10–22MB equipment images; delete the ~25–32MB **unreferenced** PNGs,
  stray `.mp4`s and `(1)` duplicate assets in `public/assets/`
- [ ] Replace `GradientBars` Framer-Motion animation with CSS keyframes (drops the `motion` lib)
- [ ] Fix FAQ "how do I book?" answer (it says email/phone, contradicting the wizard); prune /
  noindex the blog stub; dedupe the duplicated "Studio Support" section on `app/services`

---

## 🔲 Sprint 1 — design foundation ("evolve it") + accessibility criticals
**Design system (`app/globals.css` + components):**
- [ ] Fix colour contrast (WCAG 1.4.3): darker **gold** text token (gold is 2.9:1 on white — fails),
  stop using **lavender/muted-plum** as text on the hero-purple background
- [ ] Fix the `--accent` **double-definition** (silently resolves to plum, not gold)
- [ ] Real **type scale** — kill routine `text-7xl`; H1 > H2 > item hierarchy
- [ ] **Lighter photo frames** (replace `border-8`, limit to hero + gallery)
- [ ] Component primitives: `.card`, `.input`, `.badge`, `.btn-on-dark`; give `BookNowButton` a
  default style; standardise section padding + container width
- [ ] Remove dead dark-mode + radius tokens; actually use the shadow scale

**Accessibility criticals:**
- [ ] Focus-trap + focus-return + close-on-unmount for the **booking drawer** and **mobile menu**
- [ ] Make **gallery/studio image tiles** real keyboard-operable buttons (studio page is currently
  fully keyboard-inaccessible)
- [ ] Honour **prefers-reduced-motion** in JS (hero carousel, stats rotator, GradientBars) + pause control
- [ ] Label newsletter / discount / add-on inputs; add `aria-live` to booking status; `id="main-content"`
  on every page's `<main>`

---

## 🔲 Sprint 2 — page rebuilds
- [ ] **Homepage**: rebuild around the two-offer fork; concrete hero (what/where/price, passes the
  5-second test); surface price anchors; cut the duplicate second hero + the stock-photo testimonials
- [ ] **Nav/IA**: restructure around the two offers; fix Pricing↔`/services` naming; one booking
  label site-wide; make `/book-online` honour an `offer` prefill
- [ ] Cascade the new system to studio / services / equipment / gallery / members
- [ ] **Perf**: convert static pages from full `"use client"` to server components + client islands;
  trim Playfair weights; convert local fonts to woff2

---

## Notes / decisions
- Security: rotate keys, **no git-history rewrite** (imperfect + force-push risk) — decided 2026-06-13.
- Calendly free = 1 event type; hold the Calendly-vs-Cal.com decision until the redesign settles.
- Testimonials: left as placeholders for now (need real Google/IG reviews from the client).
</content>
