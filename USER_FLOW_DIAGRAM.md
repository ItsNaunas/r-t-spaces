# User Flow Diagrams

## Current Flow: "Pay & Book Now"

```
┌─────────────────────────────────────────────────────────────┐
│                    USER VISITS BOOKING PAGE                   │
│                  (/book-online)                               │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SEES CALENDLY WIDGET                            │
│         (Shows available time slots)                         │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         USER SELECTS TIME IN CALENDLY                       │
│  • Chooses date/time                                        │
│  • Enters name/email in Calendly popup                      │
│  ⚠️ CALENDLY EVENT CREATED IMMEDIATELY                      │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         FORM BECOMES ACTIVE                                  │
│  • Name, email, date, time pre-filled                      │
│  • User can add notes                                       │
│  • Price shown (if implemented)                              │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         USER CLICKS "PROCEED TO PAYMENT"                     │
│  • Form data sent to /api/checkout                          │
│  • Stripe Checkout session created                          │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         REDIRECTED TO STRIPE CHECKOUT                       │
│  • User enters payment details                              │
│  • Payment processed                                        │
└──────────────────────┬────────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    SUCCESS                      FAILURE
         │                           │
         ▼                           ▼
┌──────────────────┐      ┌──────────────────────────┐
│ Redirect to      │      │ Redirect to              │
│ /book-online?    │      │ /book-online?            │
│ success=true     │      │ canceled=true            │
└────────┬─────────┘      └──────────────────────────┘
         │                      │
         │                      │ ⚠️ CALENDLY EVENT
         │                      │   STILL RESERVED!
         │                      │
         ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│         STRIPE WEBHOOK FIRES                                │
│  • checkout.session.completed                               │
│  • Booking saved to data/bookings.json                      │
│  • Emails sent to customer & studio                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Improved Flow: Payment-First (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER VISITS BOOKING PAGE                   │
│                  (/book-online)                               │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         USER SEES PRICING & BOOKING OPTIONS                  │
│  • Hourly rate displayed                                    │
│  • Can preview calendar (read-only)                         │
│  • Selects preferred date/time range                        │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         USER FILLS BOOKING FORM                             │
│  • Name, email, notes                                       │
│  • Preferred date/time                                      │
│  • Price calculated and displayed                           │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         USER CLICKS "PROCEED TO PAYMENT"                     │
│  • Form data + price sent to /api/checkout                 │
│  • Stripe Checkout session created                          │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         REDIRECTED TO STRIPE CHECKOUT                       │
│  • User enters payment details                              │
│  • Payment processed                                        │
└──────────────────────┬────────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    SUCCESS                      FAILURE
         │                           │
         ▼                           ▼
┌──────────────────┐      ┌──────────────────────────┐
│ Redirect to      │      │ Redirect to              │
│ /book-online?    │      │ /book-online?            │
│ success=true     │      │ canceled=true            │
└────────┬─────────┘      └──────────────────────────┘
         │                      │
         │                      │ ✅ NO CALENDLY EVENT
         │                      │   CREATED (SAFE!)
         │                      │
         ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│         STRIPE WEBHOOK FIRES                                │
│  • checkout.session.completed                               │
│  • ✅ CREATE CALENDLY EVENT VIA API                         │
│  • Booking saved to database                                │
│  • Emails sent with Calendly confirmation link              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         CUSTOMER RECEIVES EMAIL                             │
│  • Payment confirmation                                     │
│  • Calendly link to confirm exact time                      │
│  • Customer clicks link and confirms time                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Current Flow: "Request Booking" (Free)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER VISITS BOOKING PAGE                   │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         USER SELECTS "REQUEST BOOKING" OPTION                │
│  • Form becomes active immediately                          │
│  • No Calendly time selection required                     │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         USER FILLS FORM                                      │
│  • Name, email                                              │
│  • Preferred date/time (manual entry)                       │
│  • Notes/requirements                                       │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         USER CLICKS "SEND ENQUIRY"                           │
│  • Form data sent to /api/bookings                          │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         BOOKING SAVED                                        │
│  • Saved to data/bookings.json                              │
│  • Emails sent to customer & studio                         │
│  • Studio confirms within 24 hours                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Payment Flow Comparison

### Current Flow Issues:
```
❌ Calendly event created BEFORE payment
   → If payment fails, slot is still reserved
   → Risk of double-booking
   → Lost revenue opportunity

❌ No pricing shown
   → User doesn't know cost until checkout
   → Surprise pricing

❌ No automatic cleanup
   → Failed payments leave Calendly events
   → Manual cleanup required
```

### Improved Flow Benefits:
```
✅ Payment processed FIRST
   → Guaranteed payment before reserving time
   → No lost slots from failed payments

✅ Price shown upfront
   → Transparent pricing
   → Better user experience

✅ Automatic Calendly creation
   → Event created AFTER payment success
   → Automatic cleanup on failure
```

---

## Data Flow Diagram

### Current Implementation:
```
User → Calendly Widget → Event Created
  ↓
Form Filled → /api/checkout → Stripe
  ↓
Payment → Webhook → Save Booking
  ↓
Email Sent
```

### Improved Implementation:
```
User → Form Filled → Price Calculated
  ↓
/api/checkout → Stripe → Payment
  ↓
Webhook → Create Calendly Event (via API)
  ↓
Save Booking → Email with Calendly Link
  ↓
User Confirms Time
```

---

## Key Decision Points

### 1. When to Create Calendly Event?
- **Current**: Before payment (risky)
- **Recommended**: After payment (safe)

### 2. How to Show Pricing?
- **Current**: Not shown
- **Recommended**: Calculate from hours, show upfront

### 3. How to Handle Failures?
- **Current**: Manual cleanup
- **Recommended**: Automatic cancellation via API

### 4. What Payment Model?
- **Current**: Full payment upfront
- **Recommended**: Deposit (50%) + Balance (50% before booking)

---

## Implementation Priority

1. **🔴 Critical**: Add pricing structure & display
2. **🔴 Critical**: Add Calendly cancellation on failure
3. **🟡 Important**: Improve success page
4. **🟡 Important**: Add refund handling
5. **🟢 Nice-to-have**: Booking management interface

