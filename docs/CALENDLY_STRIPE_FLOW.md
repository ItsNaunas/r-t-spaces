# Calendly + Stripe Integration Flow

## Overview

This implementation uses **Calendly for scheduling** (showing availability and time selection) and **Stripe for payments**. The flow ensures customers see real availability before paying.

## How It Works

### Step-by-Step Flow

1. **Customer visits booking page**
   - Sees Calendly widget embedded on the page
   - Can view all available time slots in real-time

2. **Customer selects time in Calendly**
   - Chooses an available date/time from the calendar
   - Fills in their name and email in Calendly
   - Calendly creates a scheduled event (tentative)
   - Calendly widget fires `calendly.event_scheduled` event

3. **Form appears with pre-filled data**
   - Booking form becomes active
   - Name, email, date, and time are pre-filled from Calendly
   - Customer can add notes/requirements

4. **Customer clicks "Proceed to Payment"**
   - Form data (including Calendly event URIs) is sent to `/api/checkout`
   - Stripe Checkout session is created with booking metadata
   - Customer is redirected to Stripe payment page

5. **Customer completes payment**
   - Payment processed by Stripe
   - Stripe webhook triggers on `checkout.session.completed`

6. **Booking confirmed**
   - Webhook saves booking to database
   - Confirmation emails sent (customer + studio)
   - Calendly event is already created (from step 2)

## Environment Variables Required

Add to your `.env.local`:

```env
# Calendly Integration
NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK=https://calendly.com/your-username/event-type

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email Configuration
RESEND_API_KEY=re_YOUR_RESEND_KEY_HERE
STUDIO_EMAIL=enquires@rtspaces.co.uk
FROM_EMAIL=onboarding@resend.dev
```

## Important Notes

### Calendly Event Creation

- **Calendly events are created immediately** when the customer selects a time (before payment)
- This is by design - it reserves the time slot
- If payment fails or is cancelled, you may need to manually cancel the Calendly event
- Future enhancement: Add automatic cancellation if payment fails

### Payment Flow

- Payment is required for "Pay & Book Now" option
- Free "Request Booking" option still available (doesn't use Calendly)
- Stripe metadata includes Calendly event URIs for reference

### Error Handling

- If Calendly widget fails to load, form still works (for free bookings)
- If payment fails, Calendly event remains (manual cleanup may be needed)
- All operations are non-blocking (email failures don't break booking)

## Components

### `CalendlyWidget.tsx`
- Embeds Calendly scheduling widget
- Listens for `calendly.event_scheduled` events
- Passes booking data to parent component

### `BookingForm.tsx`
- Shows Calendly widget first
- Displays form after time selection
- Handles payment flow
- Pre-fills data from Calendly

### API Routes

- `/api/checkout` - Creates Stripe Checkout session with Calendly data
- `/api/webhooks/stripe` - Processes payment and saves booking
- `/api/bookings` - Handles free booking requests (no Calendly)

## Testing

1. **Test Calendly Widget**
   - Verify widget loads and shows availability
   - Select a time and confirm form appears
   - Check that data is pre-filled correctly

2. **Test Payment Flow**
   - Select time in Calendly
   - Fill form and proceed to payment
   - Use Stripe test card: `4242 4242 4242 4242`
   - Verify webhook processes booking
   - Check emails are sent

3. **Test Free Booking**
   - Select "Request Booking" option
   - Form should work without Calendly selection
   - Verify booking is saved

## Future Enhancements

1. **Automatic Cancellation**
   - Cancel Calendly event if payment fails
   - Use Calendly API to manage events

2. **Calendly Webhooks**
   - Set up Calendly webhooks to sync events
   - Track event status changes

3. **Better Error Handling**
   - Handle Calendly API errors gracefully
   - Provide user feedback for failures

4. **Rescheduling**
   - Allow customers to reschedule via Calendly
   - Update Stripe metadata accordingly

## Troubleshooting

### Calendly Widget Not Loading
- Check `NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK` is set correctly
- Verify the Calendly link is public and accessible
- Check browser console for errors

### Payment Not Processing
- Verify Stripe keys are correct
- Check webhook endpoint is configured
- Review webhook logs in Stripe dashboard

### Emails Not Sending
- Verify Resend API key is set
- Check email addresses are valid
- Review email service logs


