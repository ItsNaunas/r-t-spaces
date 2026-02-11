This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

1. Create a `.env.local` file in the project root with the following variables:

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
STUDIO_EMAIL=enquires@rtspaces.co.uk
FROM_EMAIL=onboarding@resend.dev

# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Calendly Integration (for scheduling)
NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK=https://calendly.com/your-username/event-type
```

2. **Resend Setup** (for email notifications):
   - Sign up at [resend.com](https://resend.com)
   - Go to [API Keys](https://resend.com/api-keys) and create a new key
   - Add it as `RESEND_API_KEY`

3. **Stripe Setup** (for payments):
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Add `STRIPE_SECRET_KEY` (starts with `sk_test_` for test mode, `sk_live_` for production)
   - For webhooks, go to [Webhooks](https://dashboard.stripe.com/webhooks) and create an endpoint:
     - URL: `https://yourdomain.com/api/webhooks/stripe`
     - Events: `checkout.session.completed`
     - Copy the webhook secret as `STRIPE_WEBHOOK_SECRET`

4. **Calendly Setup** (for scheduling):
   - Sign up at [calendly.com](https://calendly.com) if you haven't already
   - Create an event type in your Calendly account (e.g., "Studio Booking")
   - Get your scheduling link:
     - Go to your Calendly event type settings
     - Copy your public Calendly scheduling link
     - Format: `https://calendly.com/your-username/event-type`
     - Add as `NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK` in your `.env.local`
   - The Calendly widget will be embedded on the booking page, allowing customers to see availability and select times before payment

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
- Customer selects time from Calendly calendar (shows real availability)
- Customer completes booking form and pays via Stripe
- Payment processed securely
- **Automated workflow triggers:**
  1. ✅ Calendly event created when time is selected
  2. ✅ Booking confirmed automatically after payment
  3. ✅ Booking saved to database with payment details
  4. ✅ Confirmation emails sent to both parties
  5. ✅ Calendar invite already sent (via Calendly)

### Booking Flow (Pay & Book)

1. **Customer selects time in Calendly widget** (embedded on booking page)
   - Sees all available time slots in real-time
   - Selects preferred date/time
   - Calendly event is created (reserves the time slot)

2. **Booking form appears with pre-filled data**
   - Name, email, date, and time from Calendly
   - Customer adds notes/requirements

3. **Customer clicks "Proceed to Payment"**
   - Redirected to Stripe Checkout for secure payment

4. **After successful payment, Stripe webhook triggers:**
   - Booking saved to database
   - Email confirmations sent
   - Calendly event already exists (from step 1)

5. **Customer redirected back with success message**

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
