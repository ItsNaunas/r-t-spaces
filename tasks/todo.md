# RT Spaces — Master plan (fixes + "evolve it" redesign)

Tracked in 3 places: **this file** (the actionable checklist), the cross-session note in
Claude memory (`rt-spaces-redesign.md`), and the full audit detail in chat. This file is the
source of truth for what's left.

Direction: **"evolve it"** — keep the plum/lavender/gold soft-luxury brand, make it cleaner,
accessible, editorial. **Goal: win client (Teddy/Evie-Rose) buy-in with a visible redesign**,
then harden for launch. Build proceeds without waiting on client feedback — they react to the
real thing. All work lands on `feature/booking-wizard`; production is only touched on a
deliberate launch.

**Re-sequenced 2026-06-13 after a deep plan review (2 subagents):** the old Sprint 0/1/2 order
front-loaded invisible SEO/perf/trust work before any visible change — backwards for a buy-in
goal. Reordered to **visible-first → approval → harden → launch**. SEO/perf is launch-gated.

**Locked decisions (2026-06-13):**
- Deposit = **50%, non-refundable** (£20 fixed stays student-package-only). Cancellation copy
  reconciled to match (no more "full refund" promise that contradicted it).
- Membership = **3-month minimum** (hero "cancel anytime" was the wrong copy; fixed).

---

## ✅ Done

**Shipped to production (master):**
- [x] Booking persistence fs → Upstash Redis (fixed the serverless bug: no confirmation emails).

**On `feature/booking-wizard` (NOT launched yet):**
- [x] Guided booking drawer-wizard (offer fork → option+extras → date/time → pay) via `BookNowButton`.
- [x] Dead-code cleanup; docs moved to `docs/` + secrets scrubbed.
- [x] Newsletter wired to Resend; fake stats normalised; Apple/Google Pay/Link in checkout.
- [x] **Pricing/policy copy made consistent (2026-06-13):** 50% non-refundable deposit everywhere
  (`book-online`); cancellation policy reconciled (was promising a "full refund" that contradicted
  the non-refundable deposit); membership aligned to 3-month minimum (`members`).

---

## 🔲 Your manual to-dos (off-code)
- [ ] **P0 — rotate the leaked Resend API key** (committed in git history; anyone with history can
  send mail as you). Rotate the test Stripe key too. Rotate-only, NO history rewrite (decided 06-13).
- [ ] Confirm the prod deploy went green; reveal the Stripe webhook `whsec_…` and confirm it matches
  `STRIPE_WEBHOOK_SECRET` in Vercel; enable Link in Stripe.
- [ ] Decide who provides **real studio photos** (the site is a *photography* studio but `next.config`
  whitelists Unsplash/Pexels — shipping stock is an own-goal) + get real testimonials from the client.
- [ ] (Optional) one real booking + self-refund to prove the confirmation email fires.

---

## 🔲 Sprint A — "Make it look evolved" (client-visible; ship a preview) ← IN PROGRESS
Goal: a Vercel preview URL worth sending. CSS/markup-heavy, low logic risk. (Build verified clean.)
- [x] **Token foundation** (`app/globals.css`): removed the dead `--accent` gold line (now resolves to
  plum cleanly); **split gold into two tokens** — `--accent-gold` (decorative) + `--gold-text`
  (oklch 0.50, passes WCAG AA on white). Reassigned gold-as-text-on-light to `--gold-text`:
  `BookingWizard` price + the white-on-gold "Most popular" badge (now plum-on-gold ~5:1),
  `StudioSections` stat numbers + the two hover links. Decorative gold-on-dark left alone.
- [x] **Lighter photo frames** — `border-8` → `border-2` on homepage (HeroSection carousel + StudioSections).
- [x] **Homepage hero** rebuilt to pass the 5-second test: eyebrow "RT Spaces · East London", concrete
  H1 "Photography studio hire, made simple", subhead with what/price/place (5m×5m, from £55, Manor Park E12).
- [x] **Type scale (homepage)** — homepage section H2/H3s brought to `text-3xl→md:text-5xl`; hero H1
  bumped to `lg:text-6xl` so it's the largest (was inverted: sections were bigger than the title).
- [x] **Cut the stock-photo testimonials** — removed `TestimonialSection` from the homepage (9 fake
  quotes w/ Unsplash faces); component kept for when real client reviews land.
- [ ] Cascade the type scale to other pages (studio/faq/services/equipment/blog/gallery still `lg:text-7xl`).
- [ ] Stop using lavender/muted-plum as text on the hero-purple background (verify on preview).
- [ ] Check for / cut the "duplicate second hero" the review flagged (identify visually on preview).
- [ ] Component primitives: `.card`, `.input`, `.badge`, `.btn-on-dark`; default style for `BookNowButton`
  (className/markup only — DO NOT touch its click handler or the BookingProvider/checkout fetch).

**Acceptance:** preview URL renders homepage with new type scale + hero, no console errors; verified
at 390px + 1280px; gold-text token measures ≥4.5:1; no contradictory pricing/policy copy remains;
**booking flow still works on the preview** (open wizard from a CTA, reach Stripe step) — no regression.

---

## 🔲 Sprint B — "Get the yes" (packaging + approval)
- [ ] Build a **before/after**: prod vs preview, mobile screenshots, 3 captions ("same brand, cleaner
  type, fixed the deposit wording, faster booking"). Doubles as the case-study asset.
- [ ] Send the single preview link + a **binary ask** ("reply 👍 to launch, or tell me one change").
- [ ] Add funnel `track()` events to wizard steps (offer-select → option → date → pay → success) so the
  case study can show conversion (`@vercel/analytics` is already mounted, pageviews only today).

---

## 🔲 Sprint C — "Harden for launch" (only AFTER approval, pre-merge)
- [ ] **Image emergency (mis-scoped before — it's not 25-32MB, it's ~1.8GB):** `public/assets` is
  triplicated across `gallery/`/`home/`/`studios/` (same files 3×, incl. `(1)` duplicates). Dedupe to
  one canonical folder, downscale source PNGs (~2560px), delete orphaned PNGs/`.mp4`s, consider Git LFS
  or moving originals out of the repo. Target `public/` under ~150MB.
- [ ] `metadataBase` + **LocalBusiness JSON-LD** (15 min, once) + FAQPage JSON-LD; `sitemap.ts`+`robots.ts`.
- [ ] Scope the **Calendly CSS `<link>`** out of the global `<head>` (the render-blocking part; the JS is
  already `afterInteractive`).
- [ ] Trim **Playfair** to used weights (currently loads 6, 400–900); convert local fonts to woff2.
- [ ] **A11y criticals:** focus-trap + return + close-on-unmount for the booking drawer (only has Esc +
  role today) AND the mobile menu; keyboard-operable gallery/studio tiles; JS-level
  `prefers-reduced-motion` on the hero carousel/stats rotator; label newsletter/discount/add-on inputs;
  `aria-live` on booking status; `id="main-content"` on every `<main>` (homepage already has it).

**Acceptance:** Lighthouse a11y ≥ 95 (homepage + studio); `public/` under ~150MB; one real Stripe-test
booking on preview → confirmation email + Redis record; webhook secret verified.

---

## 🔲 Sprint D — "Launch" (deliberate, reversible)
- [ ] Rotate leaked keys FIRST (see manual to-dos — P0, before any public sharing).
- [ ] Tag master pre-merge; merge branch; verify prod env vars; one post-launch test booking; keep
  revert-to-tag ready.

---

## ✂️ Cut as gold-plating (deferred indefinitely — invisible, regression-risk, low value)
- GradientBars Framer-Motion → CSS keyframes (won't even drop the `motion` dep; the carousel uses it).
- Dead dark-mode + radius token cleanup.
- `"use client"` → server-component + islands refactor (only 11 files; you'll rewrite those pages anyway;
  revisit only if Lighthouse perf demands it post-launch).

---

## Notes / decisions
- **Revenue no-go list (redesign must NOT touch):** `app/api/**`, `lib/redis.ts`, `lib/bookingStore.ts`,
  `lib/pendingBookings.ts`, `lib/stripe.ts`, `lib/email.ts`. Restyle = className/markup only.
- The Vercel preview URL **is the deliverable**, not a green build. Push to the branch → preview builds.
- Security: rotate keys, **no git-history rewrite** (imperfect + force-push risk) — decided 2026-06-13.
- Verify path before merge: `/code-review ultra` on the diff + `verify` skill (run app, smoke-test booking).
