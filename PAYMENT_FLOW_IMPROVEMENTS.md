# Quick Implementation Guide: Payment Flow Improvements

## Priority 1: Add Pricing Structure

### Step 1: Create Pricing Configuration

Create `lib/pricing.ts`:

```typescript
export const PRICING_CONFIG = {
  hourlyRate: 55, // £55 per hour (standard rate)
  minimumHours: 2,
  depositPercentage: 0.5, // 50% deposit
};

export function calculateHours(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.max(Math.ceil(diffHours), PRICING_CONFIG.minimumHours);
}

export function calculatePrice(hours: number): number {
  return hours * PRICING_CONFIG.hourlyRate;
}

export function calculateDeposit(totalPrice: number): number {
  return totalPrice * PRICING_CONFIG.depositPercentage;
}
```

### Step 2: Update BookingForm to Show Price

Add price calculation and display in `components/BookingForm.tsx`:

```typescript
import { calculateHours, calculatePrice, calculateDeposit, PRICING_CONFIG } from '@/lib/pricing';

// In BookingForm component:
const [bookingPrice, setBookingPrice] = useState<number | null>(null);
const [depositAmount, setDepositAmount] = useState<number | null>(null);

useEffect(() => {
  if (calendlyData) {
    const hours = calculateHours(calendlyData.startTime, calendlyData.endTime);
    const totalPrice = calculatePrice(hours);
    const deposit = calculateDeposit(totalPrice);
    
    setBookingPrice(totalPrice);
    setDepositAmount(deposit);
  } else {
    setBookingPrice(null);
    setDepositAmount(null);
  }
}, [calendlyData]);

// Add price display in JSX:
{bookingPrice && depositAmount && (
  <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 rounded-sm space-y-2">
    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
      Pricing
    </p>
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--muted-plum)]">Total Price:</span>
        <span className="font-semibold text-[var(--primary)]">${bookingPrice.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[var(--muted-plum)]">Deposit (50%):</span>
        <span className="font-semibold text-[var(--primary)]">${depositAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs pt-2 border-t border-[var(--accent)]/20">
        <span className="text-[var(--muted-plum)]">Balance Due:</span>
        <span className="text-[var(--muted-plum)]">${(bookingPrice - depositAmount).toFixed(2)} (48h before)</span>
      </div>
    </div>
  </div>
)}
```

### Step 3: Update Checkout API

Update `app/api/checkout/route.ts`:

```typescript
import { calculateHours, calculatePrice, calculateDeposit } from '@/lib/pricing';

// In POST handler:
const { name, email, date, hours, notes, calendlyEventUri, calendlyInviteeUri, startTime, endTime } = body;

// Calculate price from Calendly times or hours string
let bookingPrice = amount || 100; // fallback
let depositAmount = bookingPrice * 0.5; // fallback

if (startTime && endTime) {
  const hours = calculateHours(startTime, endTime);
  bookingPrice = calculatePrice(hours);
  depositAmount = calculateDeposit(bookingPrice);
} else if (hours) {
  // Parse hours string if needed
  // You might need to parse "8 AM – 2 PM" format
}

const session = await stripe.checkout.sessions.create({
  // ... existing config
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Studio Booking Deposit',
        description: `50% deposit for studio booking${date ? ` on ${date}` : ''}${hours ? ` (${hours})` : ''}`,
      },
      unit_amount: Math.round(depositAmount * 100),
    },
    quantity: 1,
  }],
  metadata: {
    // ... existing metadata
    totalPrice: bookingPrice.toString(),
    depositAmount: depositAmount.toString(),
    balanceDue: (bookingPrice - depositAmount).toString(),
  },
});
```

---

## Priority 2: Add Calendly Cancellation on Payment Failure

### Step 1: Set Up Calendly API

Install Calendly SDK (if available) or use REST API:

```bash
npm install @calendly/api-client
```

Or use fetch directly (simpler):

### Step 2: Create Calendly API Helper

Create `lib/calendlyApi.ts`:

```typescript
// Note: Calendly API requires authentication
// You'll need to get an API token from Calendly

const CALENDLY_API_BASE = 'https://api.calendly.com';

export async function cancelCalendlyEvent(eventUri: string) {
  if (!process.env.CALENDLY_API_TOKEN) {
    console.warn('CALENDLY_API_TOKEN not set - cannot cancel event');
    return;
  }

  try {
    // Extract event UUID from URI
    const eventId = eventUri.split('/').pop();
    
    const response = await fetch(`${CALENDLY_API_BASE}/scheduled_events/${eventId}/cancellation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'Payment failed or canceled',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel Calendly event: ${response.statusText}`);
    }

    console.log('Calendly event canceled successfully:', eventId);
  } catch (error) {
    console.error('Error canceling Calendly event:', error);
    // Don't throw - log and continue
  }
}
```

### Step 3: Update Webhook Handler

Update `app/api/webhooks/stripe/route.ts`:

```typescript
import { cancelCalendlyEvent } from '@/lib/calendlyApi';

// Add new case handlers:
case 'checkout.session.async_payment_failed':
case 'payment_intent.payment_failed': {
  const session = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
  const calendlyEventUri = 'metadata' in session ? session.metadata?.calendlyEventUri : undefined;
  
  if (calendlyEventUri) {
    console.log('Payment failed, canceling Calendly event:', calendlyEventUri);
    await cancelCalendlyEvent(calendlyEventUri);
  }
  break;
}

// Also handle checkout cancellation:
case 'checkout.session.async_payment_succeeded': {
  // Payment succeeded after async processing
  // Handle same as checkout.session.completed
  break;
}
```

---

## Priority 3: Improve Success Page

### Step 1: Update BookingSuccessMessage Component

Update `components/BookingSuccessMessage.tsx`:

```typescript
"use client";

import { useSearchParams } from 'next/navigation';

export function BookingSuccessMessage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="border-2 border-emerald-500/20 bg-emerald-500/10 p-6 rounded-sm space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-2xl text-emerald-800 mb-2">
            Payment Successful!
          </h2>
          <p className="text-emerald-700 mb-4">
            Your booking deposit has been processed successfully. We'll send you a confirmation email shortly with your booking details.
          </p>
          {sessionId && (
            <div className="mt-4 p-3 bg-white/50 rounded border border-emerald-200">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 mb-1">
                Booking Reference
              </p>
              <p className="font-mono text-sm text-emerald-800">
                {sessionId.substring(0, 20)}...
              </p>
            </div>
          )}
          <div className="mt-4 text-sm text-emerald-700">
            <p className="font-semibold mb-2">What's next?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check your email for booking confirmation</li>
              <li>Confirm your time slot via the Calendly link (if provided)</li>
              <li>We'll send a reminder 48 hours before your booking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Pass Session ID in Success URL

Update `app/api/checkout/route.ts`:

```typescript
success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book-online?success=true&session_id={CHECKOUT_SESSION_ID}`,
```

---

## Priority 4: Add Refund Handling

### Update Webhook Handler

Add refund case in `app/api/webhooks/stripe/route.ts`:

```typescript
case 'charge.refunded': {
  const charge = event.data.object as Stripe.Charge;
  console.log('Refund processed:', charge.id);
  
  // Find booking by payment intent or charge ID
  // Update booking status to 'refunded'
  // Cancel Calendly event if applicable
  
  // You'll need to add a way to find bookings by payment ID
  // Consider adding paymentIntentId to booking data
  break;
}
```

---

## Environment Variables to Add

```env
# Calendly API (for cancellation)
CALENDLY_API_TOKEN=your_calendly_api_token_here

# Pricing (optional - can be hardcoded)
HOURLY_RATE=50
DEPOSIT_PERCENTAGE=0.5
```

---

## Testing Checklist

- [ ] Price displays correctly when time is selected
- [ ] Deposit amount is calculated correctly (50% of total)
- [ ] Checkout shows correct deposit amount
- [ ] Payment success page shows booking reference
- [ ] Calendly event is canceled when payment fails
- [ ] Email confirmation includes pricing details
- [ ] Refund webhook updates booking status

---

## Next Steps After These Improvements

1. **Add booking management interface** (view/edit bookings)
2. **Implement balance payment** (collect remaining 50% before booking)
3. **Add customer portal** (view their bookings)
4. **Add email templates** (professional branded emails)
5. **Add analytics** (track bookings, revenue)

---

## Need Help?

- **Calendly API Docs**: https://developer.calendly.com/api-docs
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Stripe Refunds**: https://stripe.com/docs/refunds


