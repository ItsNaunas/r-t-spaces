# Stripe Setup Guide

## Your Test Keys

Get your keys from:
- **Publishable Key**: [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys) (starts with `pk_test_`)
- **Secret Key**: [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys) (starts with `sk_test_`)
- **Note**: The `mk_` keys don't appear to be Stripe keys (Stripe keys start with `pk_`, `sk_`, or `whsec_`)

## Important Notes

1. **The first key (`mk_...`) is not a Stripe key** - Stripe keys start with:
   - `pk_test_` or `pk_live_` (publishable keys)
   - `sk_test_` or `sk_live_` (secret keys)
   - `whsec_` (webhook secrets)

2. **You still need your Secret Key** - The publishable key you provided is for client-side use, but the current implementation uses server-side Stripe Checkout, which requires the **Secret Key**.

## Setup Steps

### 1. Get Your Secret Key

1. Go to [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
2. Find your **Secret key** (starts with `sk_test_` for test mode)
3. Copy it - you'll need it for `STRIPE_SECRET_KEY`

### 2. Get Your Webhook Secret (for local testing)

**Option A: Use Stripe CLI (Recommended for local development)**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy the webhook secret from the output (starts with `whsec_`)

**Option B: Create Webhook in Dashboard**

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set URL: `https://yourdomain.com/api/webhooks/stripe` (for production)
4. Select event: `checkout.session.completed`
5. Copy the webhook secret

### 3. Create `.env.local` File

Create a file named `.env.local` in the project root with:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email Configuration (if you have Resend set up)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
STUDIO_EMAIL=Teddy77723@gmail.com
FROM_EMAIL=onboarding@resend.dev

# Calendly Integration (optional)
CALENDLY_SCHEDULING_LINK=https://calendly.com/your-username/event-type
```

**Quick Copy Template**: I've created a `.env.local.template` file with your keys pre-filled. Copy it to `.env.local` and add your webhook secret.

### 4. Test Your Setup

1. Start your dev server: `npm run dev`
2. Go to the booking page
3. Try a test payment with Stripe test card: `4242 4242 4242 4242`
4. Use any future expiry date and any CVC

## Current Implementation

The current codebase uses **server-side Stripe Checkout**, which means:
- ✅ **Secret Key is required** (`STRIPE_SECRET_KEY`) - used on the server
- ⚠️ **Publishable Key is optional** (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) - not currently used, but good to have for future enhancements

## Testing Checklist

- [ ] Secret key added to `.env.local`
- [ ] Publishable key added to `.env.local` (optional)
- [ ] Webhook secret added to `.env.local`
- [ ] Test payment works with test card `4242 4242 4242 4242`
- [ ] Webhook receives `checkout.session.completed` event
- [ ] Booking is saved after payment
- [ ] Confirmation email is sent

## Need Help?

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe API Docs: https://stripe.com/docs/api
- Stripe CLI: https://stripe.com/docs/stripe-cli

