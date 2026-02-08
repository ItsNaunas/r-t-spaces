# 15-Minute Payment Window Setup

## Overview

The booking system now includes a 15-minute payment window for "Pay & Book Now" bookings. When a customer selects a time in Calendly, the event is scheduled immediately, but if payment isn't completed within 15 minutes, the Calendly event is automatically cancelled.

## How It Works

1. **Customer selects time in Calendly** → Calendly event is scheduled immediately
2. **Customer selects package** → Pending booking is created with 15-minute expiration
3. **Customer proceeds to Stripe checkout** → Pending booking is linked to Stripe session
4. **Payment completed** → Pending booking is confirmed, Calendly event remains scheduled
5. **Payment not completed within 15 minutes** → Calendly event is automatically cancelled

## Frontend Features

- **Countdown Timer**: Shows remaining time (MM:SS format)
- **Visual Warnings**: 
  - Yellow warning when more than 5 minutes remain
  - Red warning when less than 5 minutes remain
- **Automatic Updates**: Timer updates every second

## Backend Components

### 1. Pending Bookings Store (`lib/pendingBookings.ts`)
- Tracks Calendly events waiting for payment
- Stores expiration time (15 minutes from creation)
- Manages booking status: `pending`, `confirmed`, `cancelled`

### 2. API Endpoints

#### `/api/pending-bookings` (POST)
Creates a new pending booking when:
- Calendly event is scheduled
- Package is selected
- Payment mode is "Pay & Book Now"

#### `/api/pending-bookings` (GET)
- With `stripeSessionId` query param: Gets pending booking by Stripe session
- Without params: Cancels expired bookings (cleanup job)

#### `/api/pending-bookings` (PATCH)
Confirms a pending booking when payment succeeds

#### `/api/cancel-expired-bookings` (GET)
Cancels all expired pending bookings (for cron jobs)

### 3. Webhook Integration (`app/api/webhooks/stripe/route.ts`)
- When payment succeeds: Confirms pending booking
- Prevents auto-cancellation of paid bookings

## Setup Requirements

### 1. Calendly API Token
You need a Calendly Personal Access Token to cancel events:

1. Go to https://calendly.com/integrations/api_webhooks
2. Create a Personal Access Token
3. Add to `.env.local`:
   ```
   CALENDLY_API_TOKEN=your_token_here
   ```

### 2. Scheduled Cleanup Job
Set up a cron job to periodically cancel expired bookings:

#### Option A: Vercel Cron (Recommended)
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cancel-expired-bookings",
    "schedule": "*/5 * * * *"
  }]
}
```
This runs every 5 minutes.

#### Option B: External Cron Service
Use a service like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [UptimeRobot](https://uptimerobot.com)

Set it to call: `https://yourdomain.com/api/cancel-expired-bookings` every 5 minutes.

### 3. Environment Variables
Ensure these are set in `.env.local`:
```env
CALENDLY_API_TOKEN=your_calendly_token
NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK=https://calendly.com/your-username/event-type
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Testing

1. **Test the flow:**
   - Select "Pay & Book Now"
   - Select a package
   - Select a time in Calendly
   - Verify countdown timer appears
   - Complete payment → Booking should be confirmed
   - Check Calendly → Event should remain scheduled

2. **Test expiration:**
   - Select "Pay & Book Now"
   - Select a package
   - Select a time in Calendly
   - Wait 15 minutes (or manually call cleanup endpoint)
   - Check Calendly → Event should be cancelled

3. **Test cleanup endpoint:**
   ```bash
   curl https://yourdomain.com/api/cancel-expired-bookings
   ```

## Data Storage

Pending bookings are stored in `data/pending-bookings.json`. This file is automatically created and managed by the system.

## Troubleshooting

### Calendly events not being cancelled
- Check that `CALENDLY_API_TOKEN` is set correctly
- Verify the token has permissions to cancel events
- Check server logs for API errors

### Timer not showing
- Ensure both package and Calendly time are selected
- Check browser console for JavaScript errors
- Verify pending booking was created (check API response)

### Cleanup not running
- Verify cron job is configured correctly
- Check cron job logs
- Manually test the cleanup endpoint

## Notes

- The 15-minute window starts when both the Calendly event is scheduled AND a package is selected
- If payment is completed, the booking is confirmed and won't be cancelled
- The cleanup job should run frequently (every 5 minutes) to catch expired bookings quickly
- Cancelled Calendly events can be manually rescheduled if needed


