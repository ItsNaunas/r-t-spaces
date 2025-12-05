This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

1. Create a `.env.local` file in the project root with the following variables:

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
STUDIO_EMAIL=Teddy77723@gmail.com
FROM_EMAIL=onboarding@resend.dev

# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Calendar Integration
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
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

4. **Google Calendar Setup** (for auto-booking):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable the Google Calendar API
   - Create a Service Account:
     - Go to "IAM & Admin" > "Service Accounts"
     - Create a new service account
     - Download the JSON key file
     - Extract `client_email` as `GOOGLE_CLIENT_EMAIL`
     - Extract `private_key` as `GOOGLE_PRIVATE_KEY` (keep the quotes and newlines)
   - Share your calendar with the service account email:
     - Open Google Calendar
     - Settings > "Add calendar" > "Create new calendar" (or use existing)
     - Share the calendar with the service account email (give "Make changes to events" permission)
     - Copy the calendar ID (found in calendar settings) as `GOOGLE_CALENDAR_ID`

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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
- Customer submits booking and pays via Stripe
- Payment processed securely
- **Automated workflow triggers:**
  1. ✅ Booking confirmed automatically
  2. ✅ Calendar event created in Google Calendar
  3. ✅ Calendar invite sent to customer
  4. ✅ Confirmation emails sent to both parties
  5. ✅ Booking saved with payment details

### Booking Flow (Pay & Book)

1. Customer fills out form and selects "Pay & Book Now"
2. Redirected to Stripe Checkout for secure payment
3. After successful payment, Stripe webhook triggers:
   - Booking status updated to "confirmed"
   - Google Calendar event created automatically
   - Email confirmations sent
   - Calendar invite sent to customer
4. Customer redirected back with success message

### Pricing

- Default: £50/hour (configurable in `lib/stripe.ts`)
- Price calculated automatically based on hours requested
- Supports time ranges (e.g., "8 AM – 2 PM") or hour counts (e.g., "4 hours")

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
