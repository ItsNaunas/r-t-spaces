# Quick Setup - Your Stripe Keys

## ✅ You Have Everything You Need!

**Your Stripe Keys:**
- ✅ Secret Key: Get this from [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
- ✅ Publishable Key: Get this from [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys)

## 🚀 Quick Start

### Step 1: Create `.env.local` File

Create a file named `.env.local` in your project root (same folder as `package.json`) and paste this:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Stripe Webhook Secret (get this from Stripe CLI - see Step 2)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email Configuration (optional - add if you have Resend)
# RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
# STUDIO_EMAIL=enquires@rtspaces.co.uk
# FROM_EMAIL=onboarding@resend.dev

# Calendly Integration (optional - add if you have Calendly)
# CALENDLY_SCHEDULING_LINK=https://calendly.com/your-username/event-type
```

### Step 2: Get Webhook Secret (for local testing)

**Option A: Use Stripe CLI (Recommended)**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run this command in your terminal:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Copy the `whsec_...` secret from the output
4. Replace `whsec_YOUR_WEBHOOK_SECRET_HERE` in your `.env.local` file

**Option B: Skip for now (webhooks only needed for auto-booking)**

You can test payments without webhooks, but auto-booking (saving to database, sending emails, Calendly) won't work until you set up webhooks.

### Step 3: Test It!

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to your booking page: `http://localhost:3000/book-online`

3. Fill out the form and select "Pay & Book Now"

4. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

5. Complete the payment - you should be redirected back to your site!

## 📝 Notes

- The `mk_` keys you provided don't appear to be Stripe keys (they might be from a different service)
- Webhook secret is only needed for the full auto-booking flow (saving bookings, emails, Calendly)
- You can test payments without webhooks, but bookings won't be saved automatically

## 🐛 Troubleshooting

**Payment works but booking isn't saved?**
- You need to set up the webhook secret (Step 2)

**"Stripe is not configured" error?**
- Make sure `.env.local` is in the project root
- Restart your dev server after creating/updating `.env.local`

**Webhook not receiving events?**
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check that the webhook secret in `.env.local` matches the one from Stripe CLI

## ✅ Next Steps

Once payments work:
1. Set up webhook secret for full auto-booking
2. Add Resend API key for email notifications
3. Add Calendly link for calendar integration

See `STRIPE_SETUP.md` for detailed instructions!

