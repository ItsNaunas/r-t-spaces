import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { sendStudioNotice } from '@/lib/email';
import { cancelCalBooking } from '@/lib/calcom';
import {
  getPendingBooking,
  getPendingBookingByStripeSession,
  cancelPendingBooking,
} from '@/lib/pendingBookings';
import { getRedis } from '@/lib/redis';
import { finalizePaidSession } from '@/lib/finalizeBooking';
import { resolveCalUids } from '@/lib/calMoves';
import { alert } from '@/lib/alerts';
import { voidVoucher } from '@/lib/vouchers';
import { MEMBERSHIP_TIERS } from '@/lib/membership';

function tierName(tierId: string | undefined): string {
  return (tierId && MEMBERSHIP_TIERS[tierId]?.name) || 'membership';
}

async function customerLabel(
  stripe: Stripe,
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): Promise<string> {
  if (!customer) return 'A member';
  try {
    const c = typeof customer === 'string' ? await stripe.customers.retrieve(customer) : customer;
    if (c.deleted) return 'A member';
    return [c.name, c.email].filter(Boolean).join(' / ') || 'A member';
  } catch {
    return 'A member';
  }
}

/** Studio heads-ups go out once per Stripe event; the marker is set after sending. */
async function noticeOnce(eventId: string, send: () => Promise<void>) {
  const redis = getRedis();
  const key = `stripe:notice:${eventId}`;
  if (await redis.get(key)) return;
  await send();
  await redis.set(key, '1', { ex: 60 * 60 * 24 * 7 });
}

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
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[BOOKING] checkout event:', event.type, session.id);

        // Idempotent per session, shared with the success page. Errors throw
        // to the outer catch -> 500, so Stripe retries and the retry finishes
        // whatever didn't happen.
        const result = await finalizePaidSession(session);
        if (result.status === 'busy') {
          // The success page is finalising this session right now. Ask Stripe
          // to come back; by then it will be done (or free to redo).
          return NextResponse.json({ error: 'In progress, retry' }, { status: 409 });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await noticeOnce(event.id, async () => {
          const who = await customerLabel(stripe, sub.customer);
          await sendStudioNotice('Membership cancelled', [
            `${who}'s membership (${tierName(sub.metadata?.tierId)}) has ended.`,
            `Stripe: https://dashboard.stripe.com/subscriptions/${sub.id}`,
          ]);
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await noticeOnce(event.id, async () => {
          const who = invoice.customer_email || (await customerLabel(stripe, invoice.customer));
          await sendStudioNotice('Membership payment failed', [
            `A membership payment of £${((invoice.amount_due ?? 0) / 100).toFixed(2)} from ${who} failed. Stripe will retry it automatically.`,
            invoice.hosted_invoice_url ? `Invoice: ${invoice.hosted_invoice_url}` : '',
          ].filter(Boolean));
        });
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

        // A refunded gift voucher purchase: switch the voucher off.
        if (meta.kind === 'voucher' && sessions.data[0]) {
          const code = await getRedis().get<string>(`voucher:session:${sessions.data[0].id}`);
          if (code) await voidVoucher(code);
          console.log('Gift voucher purchase refunded, voucher switched off:', code ?? '(not issued)');
          break;
        }
        const uids = (meta.calBookingUids || meta.calBookingUid || '')
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean);
        if (!uids.length) {
          console.log('Refund with no linked Cal.com booking:', charge.id);
          break;
        }
        // A booking moved since it was paid lives under a new Cal.com uid.
        for (const uid of await resolveCalUids(uids)) {
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
    await alert('stripe-webhook', 'A Stripe webhook failed (Stripe will retry)', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
