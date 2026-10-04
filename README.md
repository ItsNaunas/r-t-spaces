This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

1. Copy `.env.example` to `.env.local` and fill it in. Every variable is
   documented there, and the real values live in Bitwarden.

```bash
cp .env.example .env.local
```

2. **Cal.com** (scheduling) — the studio's Cal.com account owns availability and
   holds the slot while payment is taken.
   - Create an API key at Settings > Developer > API keys, add it as `CAL_API_KEY`.
   - Set `NEXT_PUBLIC_CAL_USERNAME` to the account's username.
   - Run the setup script to create the schedule, one event type per package,
     and the booking webhook. It reads `lib/pricing.ts`, so Cal.com can never
     drift from the site's own package list:

     ```bash
     node scripts/setup-calcom.ts              # dry run, writes nothing
     node scripts/setup-calcom.ts --apply      # create/update
     ```

   - Connect the studio calendar (Outlook or Google) in Cal.com settings, and
     set it as the destination calendar so bookings land in the real diary.

3. **Stripe** (payments):
   - Add `STRIPE_SECRET_KEY` (`sk_test_` in test mode, `sk_live_` in production).
   - Add a webhook endpoint at `https://yourdomain.com/api/webhooks/stripe`
     subscribed to `checkout.session.completed`,
     `checkout.session.async_payment_failed` and `checkout.session.expired`
     (the last one is what releases abandoned holds), and copy its signing
     secret into `STRIPE_WEBHOOK_SECRET`.

4. **Resend** (email), **Upstash Redis** (bookings, holds, discounts) and the
   admin password: see `.env.example`.

5. **Cron** — `vercel.json` schedules `/api/cancel-expired-bookings` every five
   minutes to release unpaid holds. Set `CRON_SECRET` in Vercel; the endpoint
   refuses to run without it.

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimise and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Booking System

The booking system offers two booking options:

### 1. Request Booking (Free)
- Customer submits a booking request
- Booking is saved to `data/bookings.json`
- Email notification sent to studio
- Confirmation email sent to customer
- Manual confirmation required (within 24 hours)

### 2. Pay & Book Now (Automated)
- Customer picks a package, then a time from the embedded Cal.com calendar
- Cal.com creates the booking **unconfirmed**, holding the slot for 15 minutes
- Customer pays the deposit via Stripe Checkout
- The Stripe webhook confirms the Cal.com booking, saves it, and emails both parties
- If payment never lands, the cron sweep cancels the hold and frees the slot

**The price is computed entirely on the server.** The browser sends only
identifiers (which package, which add-ons, which Cal.com booking); the amount
charged is derived from the Cal.com booking times and the admin-managed package
list, so it cannot be influenced by the client.

## Booking Flow (Pay & Book)

1. **Customer picks a package** in the wizard (add-ons optional)

2. **Customer picks a time** in the embedded Cal.com calendar
   - Availability = studio opening hours minus the connected calendar's busy times
   - Hourly-hire packages offer a duration picker, so the calendar blocks the
     real amount of room time
   - Cal.com creates the booking **unconfirmed** and holds the slot

3. **Customer clicks "Proceed to Payment"**
   - The server re-reads the booking from Cal.com, prices it, and creates a
     Stripe Checkout session

4. **After successful payment, the Stripe webhook:**
   - Confirms the Cal.com booking (this is the only thing that makes it real)
   - Saves the booking and sends confirmation emails
   - The booking appears in the studio's connected calendar

5. **Customer redirected back with success message**

If payment is abandoned, the cron sweep cancels the unconfirmed booking after
15 minutes and the slot returns to the calendar.

### Pricing

- Standard rate: £55/hour with minimum 2 hours (configurable in `lib/pricing.ts`)
- Half-Day (5 hrs): £260 · Full-Day (9 hrs): £450
- Complimentary snacks and drinks included
- Price calculated automatically based on hours or package
- Supports time ranges (e.g., "8 AM – 2 PM") or package selection

### Production Deployment

When deploying to Vercel or other serverless platforms:

1. **Add all environment variables** in your deployment platform settings

2. **Configure Stripe Webhook**:
   - Update webhook URL to your production domain: `https://yourdomain.com/api/webhooks/stripe`
   - Use production webhook secret (starts with `whsec_`)

3. **Update base URL**:
   - Set `NEXT_PUBLIC_BASE_URL` to your production domain

4. **File Storage Note**: The current implementation uses local file storage (`data/bookings.json`), which works for development but has limitations on serverless platforms. For production, consider:
   - Using a database (PostgreSQL, MongoDB, etc.)
   - Using a service like Vercel KV or Upstash
   - Using a headless CMS

5. **Testing Webhooks Locally**:
   - Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook secret from the CLI output

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
