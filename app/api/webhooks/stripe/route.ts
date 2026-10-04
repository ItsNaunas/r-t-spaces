import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { saveBooking } from '@/lib/bookingStore';
import { sendBookingNotification } from '@/lib/email';
import { confirmCalBooking, cancelCalBooking } from '@/lib/calcom';
import {
  getPendingBooking,
  getPendingBookingByStripeSession,
  confirmPendingBooking,
  cancelPendingBooking,
  allCalUids,
} from '@/lib/pendingBookings';
import { getRedis } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const error = err as Error;
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Payment successful:', session.id);

        // Idempotency: claim this event so a Stripe retry / duplicate delivery
        // doesn't save the booking or send emails twice. Released on failure
        // below so genuine retries can still reprocess.
        const redis = getRedis();
        const eventKey = `stripe:evt:${event.id}`;
        const claimed = await redis.set(eventKey, '1', { nx: true, ex: 60 * 60 * 24 * 7 });
        if (claimed === null) {
          console.log('Duplicate Stripe event, already handled — skipping:', event.id);
          break;
        }

        const pendingBookingId = session.metadata?.pendingBookingId;
        let pendingBooking = null;

        if (pendingBookingId) {
          pendingBooking = await getPendingBooking(pendingBookingId);
        }
        if (!pendingBooking) {
          pendingBooking = await getPendingBookingByStripeSession(session.id);
        }

        // The slot is held in Cal.com as an unconfirmed booking. Payment has
        // now landed, so this is the one and only place it becomes real.
        // A block booking holds one Cal.com booking per day; confirm them all.
        const calBookingUids = pendingBooking
          ? allCalUids(pendingBooking)
          : [session.metadata?.calBookingUid].filter((u): u is string => Boolean(u));
        for (const calBookingUid of calBookingUids) {
          const confirmed = await confirmCalBooking(calBookingUid);
          if (!confirmed) {
            // Money has been taken but the slot is not secured. Loud, and
            // deliberately not silently swallowed.
            console.error(
              'PAID BUT UNCONFIRMED — needs manual confirmation in Cal.com.',
              { session: session.id, calBookingUid }
            );
          }
        }

        if (pendingBooking) {
          await confirmPendingBooking(pendingBooking.id, session.id);
          console.log('Pending booking confirmed:', pendingBooking.id);
        }

        const bookingData = {
          name: session.metadata?.customerName || session.customer_email || 'Unknown',
          email: session.metadata?.customerEmail || session.customer_email || '',
          date: session.metadata?.bookingDate || undefined,
          hours: session.metadata?.bookingHours || undefined,
          notes: session.metadata?.bookingNotes || undefined,
        };

        if (!bookingData.name || !bookingData.email) {
          console.error('Missing required booking data:', bookingData);
          break;
        }

        try {
          const savedBooking = await saveBooking(bookingData);
          console.log('Booking saved:', savedBooking);

          sendBookingNotification({
            ...savedBooking,
            paid: true,
            totalPrice: session.metadata?.totalPrice,
            depositAmount: session.metadata?.depositAmount,
            balanceDue: session.metadata?.balanceDue,
            addonsSummary: session.metadata?.addonsSummary || undefined,
            addonsTotal: session.metadata?.addonsTotal || undefined,
          }).catch((error) => {
            console.error('Email notification failed (booking still saved):', error);
          });
        } catch (error) {
          console.error(
            'Error processing booking after payment — requires manual review. Session:',
            session.id,
            error
          );
          // Release the idempotency claim so Stripe's retry can reprocess.
          await redis.del(eventKey);
          return NextResponse.json({ error: 'Booking processing failed' }, { status: 500 });
        }

        const discountCode = session.metadata?.discountCode;
        if (discountCode) {
          const { incrementDiscountUsage } = await import('@/lib/admin/kv');
          incrementDiscountUsage(discountCode).catch((err) => {
            console.error('Failed to increment discount usage:', err);
          });
        }

        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Payment failed:', session.id);

        // Release the slot straight away rather than making the studio wait for
        // the expiry sweep.
        const failedId = session.metadata?.pendingBookingId;
        const failedHold = failedId ? await getPendingBooking(failedId) : null;
        if (failedHold?.status === 'pending') {
          await cancelPendingBooking(failedHold.id, 'Payment failed');
        } else if (session.metadata?.calBookingUid) {
          await cancelCalBooking(session.metadata.calBookingUid, 'Payment failed');
        }
        break;
      }

      case 'checkout.session.expired': {
        // The customer never paid and the session closed at its expires_at
        // (set by /api/checkout). This is what releases abandoned holds; the
        // daily cron sweep is only a backstop.
        const session = event.data.object as Stripe.Checkout.Session;
        const pendingId = session.metadata?.pendingBookingId;
        const pending = pendingId
          ? await getPendingBooking(pendingId)
          : await getPendingBookingByStripeSession(session.id);

        if (pending) {
          // Never release a slot that has already been paid for.
          if (pending.status === 'pending') {
            await cancelPendingBooking(pending.id, 'Checkout expired without payment');
            console.log('Hold released after checkout expired:', pending.id);
          }
        } else if (session.metadata?.calBookingUid) {
          await cancelCalBooking(session.metadata.calBookingUid, 'Checkout expired without payment');
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', intent.id);
        // No Cal.com uid on a bare PaymentIntent — the expiry job handles it.
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        // Only a full refund frees the slot. A partial refund (e.g. keeping
        // the deposit) leaves the booking alone.
        if (!charge.refunded) {
          console.log('Partial refund, booking kept:', charge.id);
          break;
        }
        const paymentIntent =
          typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (!paymentIntent) break;

        const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent, limit: 1 });
        const meta = sessions.data[0]?.metadata ?? {};
        const uids = (meta.calBookingUids || meta.calBookingUid || '')
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean);
        if (!uids.length) {
          console.log('Refund with no linked Cal.com booking:', charge.id);
          break;
        }
        for (const uid of uids) {
          const ok = await cancelCalBooking(uid, 'Payment refunded');
          if (!ok) console.error('Refunded, but could not cancel in Cal.com (check it is not still booked):', uid);
        }
        console.log('Refund processed, Cal.com booking(s) cancelled:', charge.id, uids.length);
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
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
