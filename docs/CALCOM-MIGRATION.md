# Cal.com migration + audit fixes

Branch: `feature/calcom-migration`. **Not deployed to production.** Supersedes
every Calendly-era doc in this folder.

## Why

Calendly booked the slot the moment the customer clicked it, before any money
changed hands. Everything awkward about the old flow followed from that: a
15-minute countdown, a customer who got a "you're booked" email and then a
cancellation for something they never paid for, and holds that were never
actually released because nothing ever called the expiry endpoint.

Cal.com's "requires confirmation" event types invert it. A new booking sits
unconfirmed, and payment is what confirms it.

## The flow now

```
package  ->  Cal.com embed (slot held, unconfirmed)
         ->  POST /api/pending-bookings   (server verifies the booking with Cal.com)
         ->  POST /api/checkout           (server prices it, creates Stripe session)
         ->  Stripe Checkout
         ->  POST /api/webhooks/stripe    (confirms the Cal.com booking)
```

If payment never arrives, the cron sweep cancels the unconfirmed booking and the
slot returns to the calendar.

## What changed

**Added**
- `lib/calcom.ts` — server-side Cal.com client. Callers pass a booking uid; this
  module builds the URL. Nothing takes a URL from the browser.
- `components/CalcomWidget.tsx` — the embed. Loads Cal.com's script on demand,
  so the scheduling stylesheet no longer blocks rendering on every page.
- `app/api/webhooks/calcom/route.ts` — HMAC-verified. Keeps our records in step
  when a customer cancels from Cal.com's own emails.
- `lib/rateLimit.ts` — fixed-window Redis limiter. Fails open.
- `scripts/setup-calcom.ts` — creates the schedule, event types and webhook from
  `lib/pricing.ts`. Idempotent; re-running updates in place.
- `vercel.json` — cron for the expiry sweep.
- `.env.example` — every variable, documented.

**Deleted**
- `app/api/calendly-event-details/` — fetched any URL the browser sent with our
  API token attached. See "Security fixes" below.
- `lib/calendly.ts`, `lib/calendlyApi.ts`, `components/CalendlyWidget.tsx`
- `lib/calendar.ts` — a Google Calendar integration nothing imported, which was
  dragging in the whole `googleapis` package. The studio uses Outlook.
- Dead dependencies: `googleapis`, `@stripe/react-stripe-js`, `@stripe/stripe-js`,
  `@tabler/icons-react`, `clsx`, `tailwind-merge`.
- The `GET` and `PATCH` handlers on `/api/pending-bookings`.

## Security fixes (from the 12 Sep audit)

| # | Was | Now |
|---|---|---|
| 1 | Checkout used the browser's `totalPrice`/`depositAmount` | Server prices from the Cal.com booking + `getMergedPackages()`. Amounts in the request body are ignored entirely. |
| 2 | `/api/calendly-event-details` attached the API token to any URL the browser supplied | Endpoint deleted. The embed hands us the booking directly, so no round-trip exists. |
| 3 | `PATCH /api/pending-bookings` confirmed a hold with no payment and no auth | Handler deleted. The Stripe webhook is the only confirmer. |
| 4 | Expiry sweep had no caller — holds were never released | Vercel cron every 5 min, gated on `CRON_SECRET`. |
| 5 | Admin login: `!==` compare, no rate limit, password doubled as signing secret | Timing-safe compare, 5 attempts / 15 min per IP, separate `ADMIN_SESSION_SECRET`. |
| 6 | Pending-hold creation accepted any Calendly URI | Booking is verified with Cal.com first, and creation is idempotent per slot. |
| 9 | Discount `usedCount` used read-modify-write | Atomic `INCR` on its own key, so a `maxUses` cap holds under concurrent checkouts. |
| 10 | `/api/validate-discount` was an unlimited guessing oracle | 20 attempts / 10 min per IP. |
| 11 | Membership checkout pinned `["card"]`, suppressing wallets; copy said "cancel anytime" against a 3-month minimum | Wallets restored; copy corrected. |
| 12/13 | Success page promised a link to confirm the slot; email fell back to `@rtspaces.com` | Copy rewritten; fallbacks corrected to `.co.uk`. |
| 14 | Calendly stylesheet render-blocking on every page | Embed script loads on demand inside the widget. |

**Also verified:** the July "leaked keys in git history" task was a false alarm.
Every key ever committed was a placeholder (`sk_test_xxxx`). Nothing to rotate
for that reason. The *current* Cal.com key should still be rotated before launch
because it passed through a terminal session.

## Cal.com account state (already configured)

- Account: `enquires@rtspaces.co.uk`, free plan, London timezone
- Schedule "Studio opening hours": daily 08:00–23:00
- Eight event types, one per package, slugged with the package id
- Hourly hire 2–9h and student hire 1–9h carry duration pickers; fixed packages
  have their length baked in
- 15-minute turnover buffer, 2 hours minimum notice, 120-day booking window
- Outlook connected, primary calendar conflict-checked, set as destination
- Stock 15/30-minute event types from signup still exist and should be deleted

## Still to do before launch

1. **Delete the stock Cal.com event types** (15min, 30min, secret) — publicly bookable.
2. **Change the Cal.com username** from `rose-teddy-r3794p` to something branded.
   The API ignores this field; it has to be done in the UI. Then update
   `NEXT_PUBLIC_CAL_USERNAME`.
3. **Create the Cal.com webhook** once the branch is deployed somewhere public:
   set `CAL_WEBHOOK_SECRET`, then `node scripts/setup-calcom.ts --apply`.
4. **Decide on Cal.com's own emails.** Cal.com and Resend will both email the
   customer and contradict each other. The event type has an `emailSettings`
   field to suppress Cal.com's; the script can set it once the call is made.
5. **Set the new env vars in Vercel:** `CAL_API_KEY`, `NEXT_PUBLIC_CAL_USERNAME`,
   `CAL_WEBHOOK_SECRET`, `CRON_SECRET`, `ADMIN_SESSION_SECRET`.
6. **One real end-to-end test booking** on the preview with a live card, then
   refund it. Confirm: slot held, deposit taken, booking confirmed in Cal.com,
   appears in Outlook, confirmation email sent, and an abandoned checkout
   releases the slot within five minutes.
7. **Rotate `CAL_API_KEY`.**

## Open questions for the client

- Deposit or full payment? Everything currently assumes 50%.
- How is the balance collected? Today it is manual, on the day, every time.
- The policies page says overtime is "charged automatically to the card on file",
  but no card is ever saved. Either save cards at checkout or change the wording.
- Does the "request a booking" path survive? A 24-hour manual confirmation next
  to an instant-pay button undercuts the instant one.
- The FAQ says the balance is due before the session; the booking page says on
  the day. One of them is wrong.

## Known gaps not addressed here

- **Admin price overrides don't affect hourly packages.** An override sets
  `price`, but `priceFromTime` packages compute from an hourly rate and ignore
  it. Pre-existing; worth fixing when the pricing model is next touched.
- **Bookings still have no status field.** Refunds and reschedules are logged
  but change no state. This is the foundation needed for reminders, review
  requests and rebooking offers.
- **Stock photo hosts** remain whitelisted in `next.config.ts` because the
  unrendered `TestimonialSection` still references Unsplash avatars. Remove both
  together.
