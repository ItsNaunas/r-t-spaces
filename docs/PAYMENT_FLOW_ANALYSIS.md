# Payment & Booking Flow Analysis & Improvement Plan

## Current User Flow

### Flow 1: "Pay & Book Now" (With Calendly)

1. **User visits booking page** (`/book-online`)
   - Sees Calendly widget embedded
   - Can view available time slots

2. **User selects time in Calendly**
   - Chooses date/time from calendar
   - Enters name/email in Calendly popup
   - ⚠️ **Calendly event is created IMMEDIATELY** (before payment)
   - Calendly fires `calendly.event_scheduled` event

3. **Form becomes active**
   - Name, email, date, time pre-filled
   - User can add notes/requirements
   - User clicks "Proceed to Payment"

4. **Stripe Checkout**
   - Form data sent to `/api/checkout`
   - Stripe Checkout session created
   - User redirected to Stripe payment page
   - User enters payment details

5. **Payment Processing**
   - Stripe processes payment
   - User redirected back to `/book-online?success=true`
   - Stripe webhook fires `checkout.session.completed`

6. **Booking Confirmation**
   - Webhook saves booking to `data/bookings.json`
   - Emails sent to customer and studio
   - ✅ Booking complete

### Flow 2: "Request Booking" (Free, No Calendly)

1. **User selects "Request Booking" option**
   - Form becomes active immediately
   - No Calendly time selection required

2. **User fills form**
   - Enters name, email, preferred date/time manually
   - Adds notes

3. **Form submission**
   - Data sent to `/api/bookings`
   - Booking saved to `data/bookings.json`
   - Emails sent
   - ✅ Booking request complete

---

## Current Issues & Gaps

### 🔴 Critical Issues

1. **Calendly Event Created Before Payment**
   - If payment fails/cancels, Calendly slot is still reserved
   - No automatic cleanup mechanism
   - Risk of double-booking or lost revenue

2. **No Pricing Structure**
   - Hardcoded $100 default amount
   - No way to set different prices for different booking types
   - No hourly rate calculation
   - No deposit/balance split

3. **No Payment Amount in Checkout**
   - User doesn't see price before checkout
   - No way to calculate based on hours/duration

4. **No Refund Handling**
   - Webhook doesn't handle refunds
   - No cancellation flow

5. **Success Page is Generic**
   - Doesn't show booking details
   - Doesn't show payment confirmation
   - No booking reference number

### 🟡 Medium Priority Issues

6. **No Booking Status Tracking**
   - Can't track if booking is confirmed/pending/cancelled
   - No way to update booking status

7. **No Calendly API Integration**
   - Can't cancel Calendly events programmatically
   - Can't verify if event exists
   - Can't sync booking status

8. **Metadata Limitations**
   - Stripe metadata has size limits
   - Complex data might not fit

9. **No Error Recovery**
   - If webhook fails, booking might not be saved
   - No retry mechanism
   - No manual reconciliation process

10. **No Booking Management**
    - Can't view/edit bookings
    - No admin interface
    - Bookings stored in JSON file (not scalable)

### 🟢 Nice-to-Have Improvements

11. **No Email Templates**
    - Basic HTML emails
    - No branding consistency

12. **No Analytics**
    - Can't track conversion rates
    - No booking statistics

13. **No Customer Portal**
    - Customers can't view their bookings
    - Can't reschedule/cancel themselves

---

## Recommended User Flow (Improved)

### Option A: Payment-First Flow (Recommended)

**Best for: Preventing double-bookings and ensuring payment**

1. **User visits booking page**
   - Sees pricing information
   - Selects booking type/duration
   - Sees total price

2. **User fills booking form**
   - Name, email, notes
   - Preferred date/time (manual or from calendar preview)

3. **User proceeds to payment**
   - Price calculated based on selection
   - Stripe Checkout with clear pricing
   - Payment processed

4. **After successful payment**
   - Webhook receives payment confirmation
   - **THEN** create Calendly event via API
   - Send Calendly invite link to customer
   - Save booking with payment confirmation

5. **Customer confirms time**
   - Receives email with Calendly link
   - Clicks link to confirm exact time slot
   - Booking fully confirmed

**Pros:**
- ✅ Payment guaranteed before reserving time
- ✅ No lost slots from failed payments
- ✅ Better cash flow

**Cons:**
- ⚠️ Two-step process (payment then time selection)
- ⚠️ Requires Calendly API integration

### Option B: Time-First with Payment Hold (Alternative)

**Best for: Better UX, but requires payment holds**

1. **User selects time in Calendly**
   - Time slot reserved temporarily (5-10 min)
   - Calendly event created with "tentative" status

2. **User proceeds to payment**
   - Payment processed immediately
   - If successful, confirm Calendly event
   - If failed, cancel Calendly event automatically

3. **Booking confirmed**
   - Calendly event confirmed
   - Booking saved
   - Emails sent

**Pros:**
- ✅ Better UX (time selection first)
- ✅ Automatic cleanup on payment failure

**Cons:**
- ⚠️ Requires Calendly API for cancellation
- ⚠️ Temporary holds might expire

### Option C: Hybrid Approach (Current + Improvements)

**Best for: Minimal changes, incremental improvements**

1. Keep current flow (Calendly first)
2. Add payment amount calculation
3. Add Calendly cancellation on payment failure
4. Improve success page
5. Add booking management

---

## Implementation Recommendations

### Phase 1: Critical Fixes (Week 1)

#### 1. Add Pricing Structure
```typescript
// lib/pricing.ts
export const PRICING = {
  hourly: 50, // $50/hour
  halfDay: 200, // 4 hours
  fullDay: 350, // 8 hours
  deposit: 0.5, // 50% deposit
};

export function calculatePrice(hours: string): number {
  // Parse hours and calculate
  // Return price in dollars
}
```

#### 2. Show Price Before Checkout
- Display calculated price in form
- Show price breakdown
- Update checkout API to use calculated price

#### 3. Add Calendly Cancellation
- Integrate Calendly API
- Cancel event if payment fails
- Cancel event if user cancels checkout

#### 4. Improve Success Page
- Show booking details
- Show payment confirmation
- Include booking reference

### Phase 2: Enhanced Features (Week 2-3)

#### 5. Add Booking Status
```typescript
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
```

#### 6. Add Refund Handling
- Webhook handler for refunds
- Update booking status
- Cancel Calendly event on refund

#### 7. Add Booking Management
- Admin interface to view bookings
- Ability to update status
- Export bookings

### Phase 3: Advanced Features (Week 4+)

#### 8. Customer Portal
- View bookings
- Reschedule/cancel
- Download invoices

#### 9. Email Templates
- Professional branded emails
- Booking confirmations
- Reminders

#### 10. Analytics Dashboard
- Booking statistics
- Revenue tracking
- Popular time slots

---

## Technical Implementation Details

### 1. Calendly API Integration

```typescript
// lib/calendly.ts
import { CalendlyApi } from '@calendly/api';

export async function cancelCalendlyEvent(eventUri: string) {
  // Cancel event via Calendly API
}

export async function createCalendlyEvent(data: {
  eventType: string;
  inviteeEmail: string;
  startTime: string;
}) {
  // Create event via Calendly API
}
```

### 2. Pricing Calculation

```typescript
// components/BookingForm.tsx
const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

useEffect(() => {
  if (calendlyData) {
    const hours = calculateHours(calendlyData.startTime, calendlyData.endTime);
    const price = calculatePrice(hours);
    setCalculatedPrice(price);
  }
}, [calendlyData]);
```

### 3. Enhanced Checkout API

```typescript
// app/api/checkout/route.ts
const price = calculatePrice(hours);
const deposit = price * PRICING.deposit;

const session = await stripe.checkout.sessions.create({
  // ... existing code
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Studio Booking Deposit',
        description: `Deposit for ${hours} hour booking`,
      },
      unit_amount: Math.round(deposit * 100),
    },
    quantity: 1,
  }],
  // Store full price in metadata for balance calculation
  metadata: {
    ...existingMetadata,
    totalPrice: price.toString(),
    depositAmount: deposit.toString(),
  },
});
```

### 4. Enhanced Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
case 'checkout.session.completed': {
  // ... existing code
  
  // Create Calendly event AFTER payment
  if (calendlyEventUri && calendlyInviteeUri) {
    // Event already exists, just confirm it
  } else {
    // Create new Calendly event via API
    await createCalendlyEvent({
      eventType: session.metadata.eventType,
      inviteeEmail: bookingData.email,
      startTime: bookingData.date,
    });
  }
  
  break;
}

case 'checkout.session.async_payment_failed':
case 'payment_intent.payment_failed': {
  // Cancel Calendly event if payment fails
  const calendlyEventUri = session.metadata?.calendlyEventUri;
  if (calendlyEventUri) {
    await cancelCalendlyEvent(calendlyEventUri);
  }
  break;
}
```

---

## Recommended Next Steps

1. **Decide on flow approach** (Payment-First vs Time-First vs Hybrid)
2. **Set up Calendly API** (get API key, test integration)
3. **Implement pricing structure** (hourly rates, deposits)
4. **Add price display** in booking form
5. **Enhance checkout** with calculated prices
6. **Add Calendly cancellation** on payment failure
7. **Improve success page** with booking details
8. **Test end-to-end flow** thoroughly

---

## Questions to Consider

1. **Pricing Model:**
   - Hourly rate? ($X/hour)
   - Fixed packages? (Half-day, Full-day)
   - Deposit + balance? (50% now, 50% later)

2. **Booking Flow Preference:**
   - Payment first (safer, but two steps)
   - Time first (better UX, but requires cleanup)
   - Hybrid (current with improvements)

3. **Cancellation Policy:**
   - Automatic refunds?
   - Manual review?
   - Partial refunds?

4. **Booking Management:**
   - Need admin dashboard?
   - Need customer portal?
   - How to handle rescheduling?

5. **Calendly Integration:**
   - Use Calendly API? (requires API key)
   - Keep widget-only? (simpler, but limited)

---

## Environment Variables Needed

```env
# Existing
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=...

# New - Calendly API (if using API integration)
CALENDLY_API_KEY=...
CALENDLY_ORGANIZATION_URI=...

# New - Pricing
HOURLY_RATE=50
DEPOSIT_PERCENTAGE=0.5
```

---

## Summary

**Current State:** Basic payment flow works, but has critical gaps around pricing, Calendly integration, and error handling.

**Recommended Approach:** 
1. Start with **Hybrid Approach** (minimal changes)
2. Add pricing structure
3. Add Calendly cancellation
4. Improve success page
5. Then consider **Payment-First Flow** for better reliability

**Priority Order:**
1. ✅ Pricing structure & display
2. ✅ Calendly cancellation on failure
3. ✅ Enhanced success page
4. ✅ Refund handling
5. ✅ Booking management

Would you like me to implement any of these improvements?


