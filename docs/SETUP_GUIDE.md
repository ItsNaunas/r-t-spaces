# Automated Booking System Setup Guide

This guide will help you set up the automated booking system with payments and calendar integration.

## Quick Start Checklist

- [ ] Set up Resend for emails
- [ ] Set up Stripe for payments
- [ ] Set up Google Calendar API
- [ ] Configure environment variables
- [ ] Test the booking flow

## Step-by-Step Setup

### 1. Resend (Email Notifications)

1. Sign up at [resend.com](https://resend.com)
2. Go to [API Keys](https://resend.com/api-keys)
3. Create a new API key
4. Add to `.env.local`: `RESEND_API_KEY=re_...`

**For Production:**
- Verify your domain in Resend
- Update `FROM_EMAIL` to use your verified domain

### 2. Stripe (Payments)

1. Sign up at [stripe.com](https://stripe.com)
2. Get API keys from [Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
   - Test mode: `sk_test_...` and `pk_test_...`
   - Production: `sk_live_...` and `pk_live_...`
3. Add to `.env.local`: `STRIPE_SECRET_KEY=sk_test_...`

**Webhook Setup:**
1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set URL: `https://yourdomain.com/api/webhooks/stripe` (or use Stripe CLI for local testing)
4. Select event: `checkout.session.completed`
5. Copy the webhook secret: `whsec_...`
6. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Local Testing:**
```bash
# Install Stripe CLI
# Then run:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook secret from the output
```

### 3. Google Calendar (Auto-Booking)

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select existing)

2. **Enable Calendar API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

3. **Create Service Account:**
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name it (e.g., "booking-automation")
   - Click "Create and Continue"
   - Skip role assignment, click "Done"

4. **Download Key:**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Download the file

5. **Extract Credentials:**
   - Open the downloaded JSON file
   - Copy `client_email` → `GOOGLE_CLIENT_EMAIL`
   - Copy `private_key` → `GOOGLE_PRIVATE_KEY` (keep quotes and `\n`)

6. **Share Calendar:**
   - Open [Google Calendar](https://calendar.google.com)
   - Create a new calendar (or use existing)
   - Go to calendar settings
   - Under "Share with specific people", add the service account email
   - Give it "Make changes to events" permission
   - Copy the Calendar ID (found in "Integrate calendar" section)
   - Add to `.env.local`: `GOOGLE_CALENDAR_ID=...@group.calendar.google.com`

### 4. Environment Variables

Create `.env.local` with all variables:

```env
# Email
RESEND_API_KEY=re_...
STUDIO_EMAIL=enquires@rtspaces.co.uk
FROM_EMAIL=onboarding@resend.dev

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Calendar
GOOGLE_CLIENT_EMAIL=...@...iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="<service-account private key, PEM with literal \n line breaks>"
GOOGLE_CALENDAR_ID=...@group.calendar.google.com
```

## Testing

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test booking flow:**
   - Go to `/book-online`
   - Fill out the form
   - Select "Pay & Book Now"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete payment
   - Check that:
     - ✅ Booking appears in `data/bookings.json`
     - ✅ Calendar event created in Google Calendar
     - ✅ Confirmation emails sent

3. **Test webhook locally:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Pricing Configuration

Edit `lib/pricing.ts` to customise pricing:
- `hourlyRate`: Standard rate per hour in GBP (e.g. 55 for £55/hr)
- `minimumHours`: Minimum booking length in hours (e.g. 2)
- `BOOKING_PACKAGES`: Half-day, full-day, and resident creative package prices

## Troubleshooting

**Webhook not working:**
- Check webhook secret matches
- Verify webhook URL is correct
- Check Stripe dashboard for webhook delivery logs

**Calendar not creating events:**
- Verify service account has calendar access
- Check calendar ID is correct
- Ensure private key includes `\n` characters

**Emails not sending:**
- Verify Resend API key
- Check FROM_EMAIL is valid
- Check Resend dashboard for delivery logs

## Production Checklist

- [ ] Use production Stripe keys (`sk_live_...`)
- [ ] Update webhook URL to production domain
- [ ] Verify domain in Resend
- [ ] Update `FROM_EMAIL` to verified domain
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production URL
- [ ] Consider migrating from file storage to database




