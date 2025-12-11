# How to Find Your Stripe Webhook Secret

There are two ways to get your webhook secret, depending on whether you're testing locally or deploying to production.

---

## Method 1: Stripe CLI (Recommended for Local Testing) ⭐

This is the **easiest** method for local development:

### Step 1: Install Stripe CLI

**Windows:**
- Download from: https://github.com/stripe/stripe-cli/releases/latest
- Or use Chocolatey: `choco install stripe`
- Or use Scoop: `scoop install stripe`

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download the latest release
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_X.X.X_windows_x86_64.zip
# Extract and add to PATH
```

### Step 2: Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authorize the CLI.

### Step 3: Forward Webhooks to Your Local Server

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Step 4: Copy the Webhook Secret

You'll see output like this:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

**Copy the `whsec_...` secret** and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

**Keep this terminal window open** while testing - it needs to stay running to forward webhooks!

---

## Method 2: Stripe Dashboard (For Production)

If you're deploying to production or want to set up webhooks in the dashboard:

### Step 1: Go to Webhooks in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"** (or **"Create endpoint"**)

### Step 2: Configure the Webhook

1. **Endpoint URL**: 
   - For production: `https://yourdomain.com/api/webhooks/stripe`
   - For local testing with Stripe CLI: Leave blank (CLI handles this)

2. **Description**: "Studio Booking Webhook" (optional)

3. **Events to send**: Select **"checkout.session.completed"**
   - Or choose "Select all events" if you want to receive all events

4. Click **"Add endpoint"**

### Step 3: Get the Webhook Secret

1. After creating the endpoint, click on it to view details
2. Look for **"Signing secret"** section
3. Click **"Reveal"** or **"Click to reveal"**
4. Copy the secret (starts with `whsec_`)

### Step 4: Add to Environment Variables

Add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## Which Method Should I Use?

### Use Stripe CLI (Method 1) if:
- ✅ You're testing locally
- ✅ You want the easiest setup
- ✅ You're developing on your computer

### Use Dashboard (Method 2) if:
- ✅ You're deploying to production
- ✅ You want a permanent webhook endpoint
- ✅ You're testing on a live server

---

## Testing Your Webhook

### With Stripe CLI Running:

1. Make a test payment on your site
2. Watch the Stripe CLI terminal - you should see:
   ```
   --> checkout.session.completed [evt_xxxxx]
   <-- [200] POST http://localhost:3000/api/webhooks/stripe [evt_xxxxx]
   ```

3. Check your server logs - you should see:
   ```
   Payment successful: cs_test_xxxxx
   Booking saved: ...
   ```

### Without Webhook (Limited Functionality):

- ✅ Payments will work
- ❌ Bookings won't be saved automatically
- ❌ Emails won't be sent automatically
- ❌ Calendly links won't be generated

---

## Troubleshooting

### "Webhook secret not found" error
- Make sure `.env.local` has `STRIPE_WEBHOOK_SECRET=whsec_...`
- Restart your dev server after adding it

### "Webhook signature verification failed"
- The webhook secret doesn't match
- Make sure you're using the secret from the same Stripe account
- If using CLI, make sure it's still running

### Webhook not receiving events
- **With CLI**: Make sure `stripe listen` is still running
- **With Dashboard**: Make sure the endpoint URL is correct and accessible
- Check that you selected the right event (`checkout.session.completed`)

### Can't find webhook secret in dashboard
- Click on the webhook endpoint you created
- Look for "Signing secret" section
- Click "Reveal" to show it
- If you don't see it, try creating a new endpoint

---

## Quick Reference

**Stripe CLI Command:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Dashboard URL:**
https://dashboard.stripe.com/webhooks

**Environment Variable:**
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## Need More Help?

- Stripe CLI Docs: https://stripe.com/docs/stripe-cli
- Stripe Webhooks Guide: https://stripe.com/docs/webhooks
- Stripe Dashboard: https://dashboard.stripe.com

