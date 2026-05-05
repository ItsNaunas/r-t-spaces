import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { saveBooking } from '@/lib/bookingStore';
import { sendBookingNotification } from '@/lib/email';
import { createCalendlyEvent } from '@/lib/calendly';
import { getPendingBookingByStripeSession, confirmPendingBooking } from '@/lib/pendingBookings';

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const error = err as Error;
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Payment successful:', session.id);
        
        // Check if this is a pending booking (Pay & Book Now flow)
        const pendingBookingId = session.metadata?.pendingBookingId;
        let pendingBooking = null;
        
        if (pendingBookingId) {
          // Try to get by ID first
          const { getPendingBooking } = await import('@/lib/pendingBookings');
          pendingBooking = await getPendingBooking(pendingBookingId);
        }
        
        // If not found by ID, try by Stripe session ID
        if (!pendingBooking) {
          pendingBooking = await getPendingBookingByStripeSession(session.id);
        }
        
        // If we have a pending booking, confirm it (this prevents auto-cancellation)
        if (pendingBooking) {
          await confirmPendingBooking(pendingBooking.id, session.id);
          console.log('Pending booking confirmed:', pendingBooking.id);
        }
        
        // Extract booking data from session metadata
        const bookingData = {
          name: session.metadata?.customerName || session.customer_email || 'Unknown',
          email: session.metadata?.customerEmail || session.customer_email || '',
          date: session.metadata?.bookingDate || undefined,
          hours: session.metadata?.bookingHours || undefined,
          notes: session.metadata?.bookingNotes || undefined,
        };

        // Validate required fields
        if (!bookingData.name || !bookingData.email) {
          console.error('Missing required booking data:', bookingData);
          break;
        }

        try {
          // Save booking to database
          const savedBooking = await saveBooking(bookingData);
          console.log('Booking saved:', savedBooking);

          // If this was a pending booking with Calendly event, it's already scheduled
          // Otherwise, create Calendly scheduling link (for request flow)
          let calendlyLink = null;
          if (!pendingBooking || !pendingBooking.calendlyEventUri) {
            calendlyLink = await createCalendlyEvent(savedBooking);
          }

          // Send email notifications
          sendBookingNotification({
            ...savedBooking,
            calendlyLink: calendlyLink || undefined,
            totalPrice: session.metadata?.totalPrice,
            depositAmount: session.metadata?.depositAmount,
            balanceDue: session.metadata?.balanceDue,
            addonsSummary: session.metadata?.addonsSummary || undefined,
            addonsTotal: session.metadata?.addonsTotal || undefined,
          }).catch((error) => {
            console.error('Email notification failed (booking still saved):', error);
          });

          console.log('Booking processed successfully. Calendly event:', pendingBooking?.calendlyEventUri ? 'already scheduled' : (calendlyLink ? 'link created' : 'not created'));
        } catch (error) {
          console.error('Error processing booking after payment — requires manual review. Session:', session.id, error);
          // Return 500 so Stripe retries this webhook rather than silently losing the booking
          return NextResponse.json({ error: 'Booking processing failed' }, { status: 500 });
        }

        // Increment discount code usage if one was applied
        const discountCode = session.metadata?.discountCode;
        if (discountCode) {
          const { incrementDiscountUsage } = await import('@/lib/admin/kv');
          incrementDiscountUsage(discountCode).catch((err) => {
            console.error('Failed to increment discount usage:', err);
          });
        }

        break;
      }
      case 'checkout.session.async_payment_failed':
      case 'payment_intent.payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
        console.log('Payment failed:', 'id' in session ? session.id : 'unknown');
        
        // In payment-first flow, no Calendly event exists yet, so no cleanup needed
        // But we can log this for tracking
        console.log('Payment failed - no Calendly cleanup needed (payment-first flow)');
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Refund processed:', charge.id);
        
        // TODO: Update booking status to 'refunded' if you add status tracking
        // For now, just log it
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent successful:', paymentIntent.id);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
