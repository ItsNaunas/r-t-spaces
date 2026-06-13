# RT Spaces — Dummy-proof booking flow

Goal: make booking as idiot-proof as possible. One decision per step, natural order,
always-visible price + deposit, openable from anywhere, never reach an invalid state.

## Approach
Guided booking **wizard** (4 steps) shown inside a global slide-over **drawer**, triggered
by every "Book" CTA so the user never loses context. Reuses the proven booking logic from
`BookingForm` (Calendly handshake, pending-booking hold, Stripe checkout) — only the
presentation changes, to keep the live revenue path safe.

Steps: 1) Offer fork (Hire vs Session) → 2) Pick option + extras → 3) Date & time → 4) Pay.
"Request a booking" demoted to a quiet fallback link.

## Tasks
- [ ] Phase 1 — Plumbing
  - [ ] `BookingProvider` context (openBooking/closeBooking + prefill) wrapping the app
  - [ ] `BookingDrawer` slide-over (focus/esc/scroll-lock, backdrop, mobile full-screen)
  - [ ] Mount provider+drawer in layout; wire SiteHeader + FloatingBookButton + mobile nav
- [ ] Phase 2 — The wizard
  - [ ] `BookingWizard`: 4 gated steps, progress bar, sticky summary footer (Total / Deposit)
  - [ ] Offer fork filters packages (flat cards, one tap) — replaces nested accordion
  - [ ] Reuse Calendly handler, pending-booking effect, discount, checkout submit verbatim
  - [ ] Request-booking as secondary path
- [ ] Phase 3 — Adopt
  - [ ] `/book-online` renders the wizard inline; homepage CTA opens the drawer
- [ ] Phase 4 — Payment polish
  - [ ] Enable wallet payments (Apple/Google Pay/Link) in checkout route
  - [ ] Plain-English deposit-vs-balance copy at the pay step
- [ ] Verify: tsc + lint + production build green after each phase

## Notes / caveats
- Calendly step can only be fully click-tested with the live `NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK`.
- Calendly free = 1 event type (hold the Calendly-vs-Cal.com decision until wizard shape is set).
- Stripe is usage-priced (no plan upgrade needed); wallets are a dashboard toggle + domain verify.

## Review
Done (build + tsc + lint green):
- Phase 1: `BookingProvider` wraps the app in `app/layout.tsx`; `BookingDrawer` slide-over
  (esc, scroll-lock, backdrop, mobile full-screen / desktop right panel). Header "Book Online"
  (desktop + mobile) and `FloatingBookButton` now open the drawer instead of `/#contact`.
- Phase 2: `BookingWizard` (components/booking/) — 4 gated steps (Offer fork → Option + extras →
  Date/time → Review & pay), progress bar, sticky "Deposit due now" footer. Flat one-tap option
  cards replace the triple-nested accordion. Reuses the exact Calendly handler, pending-booking
  hold + 15-min countdown, discount validation, and Stripe checkout submit from `BookingForm`.
  "Send an enquiry instead" is the demoted request path.
- Phase 4: checkout route no longer pins `payment_method_types: ['card']`, so Apple Pay /
  Google Pay / Link surface automatically in hosted Checkout.

- Phase 3 (DONE): `/book-online` renders the wizard inline; homepage `#contact` now a book-CTA +
  real contact details. Reusable `BookNowButton` created; every booking-intent CTA across studio,
  services, equipment, gallery, members, policies, InfoPopup, footer + overlays now opens the
  drawer. Genuine "Message us / Contact" links still point at the contact section. Orphaned
  `BookingForm.tsx` (the old monolith) deleted.

Outstanding (future / nice-to-have):
- Surface wallet buttons even earlier via Stripe Express Checkout; "no booking fee" trust line;
  optional phone field with reason. Calendly-vs-Cal.com decision (free tier = 1 event type).

Needs the client (manual, off-code):
- Click-test the Calendly step with the live NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK + a Stripe test
  payment (logic preserved from the working form, but the Calendly handshake can't be tested here).
- In Stripe Dashboard: enable Apple Pay / Google Pay / Link payment methods.
