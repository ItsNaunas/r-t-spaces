import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getPromotion } from '@/lib/promotionStore';
import {
  BLOCK_EVENT_PACKAGE_ID,
  isPromotionLive,
  isWeekendInLondon,
  londonDateKey,
  addDaysToKey,
} from '@/lib/promotion';
import { calculateDeposit } from '@/lib/pricing';
import {
  cancelCalBooking,
  createCalBooking,
  getAvailableSlots,
  getEventTypeId,
} from '@/lib/calcom';
import {
  savePendingBooking,
  cancelPendingBooking,
  updatePendingBookingStripeSession,
  CHECKOUT_WINDOW_MINUTES,
} from '@/lib/pendingBookings';
import { rateLimit, clientIp } from '@/lib/rateLimit';

// Creating up to 15 Cal.com bookings takes a few seconds.
export const maxDuration = 60;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EXTRA_BACKDROPS = 5;

/**
 * Block booking checkout (special offer). The customer picks N full days in
 * our own date picker; this route re-checks everything against the live
 * promotion and Cal.com, holds every day as an unconfirmed Cal.com booking,
 * then opens one Stripe Checkout for the deposit. The Stripe webhook confirms
 * all the days together, or the expiry path releases them together.
 *
 * As with /api/checkout, the browser sends choices, never amounts.
 */
export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const { allowed } = await rateLimit('block-checkout', clientIp(await headers()), 10, 10 * 60);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
    }

    const body = (await request.json()) ?? {};
    const days = Number(body.days);
    const starts: unknown = body.starts;
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : '';
    const extraBackdrops = Math.min(
      MAX_EXTRA_BACKDROPS,
      Math.max(0, Math.floor(Number(body.extraBackdrops) || 0))
    );

    if (!name || !EMAIL.test(email)) {
      return NextResponse.json({ error: 'Please enter your name and a valid email.' }, { status: 400 });
    }

    // ── The offer, as it stands right now ─────────────────────────────────────
    const promotion = await getPromotion();
    if (!isPromotionLive(promotion)) {
      return NextResponse.json({ error: 'This offer has ended.' }, { status: 410 });
    }
    const bundle = promotion.bundles.find((b) => b.enabled && b.days === days);
    if (!bundle) {
      return NextResponse.json({ error: 'That block booking is not available.' }, { status: 400 });
    }

    // ── The chosen days ───────────────────────────────────────────────────────
    if (!Array.isArray(starts) || starts.length !== bundle.days || !starts.every((s) => typeof s === 'string')) {
      return NextResponse.json({ error: `Please pick exactly ${bundle.days} days.` }, { status: 400 });
    }
    const chosen = (starts as string[])
      .map((s) => new Date(s))
      .filter((d) => !Number.isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime())
      .map((d) => d.toISOString());
    if (chosen.length !== bundle.days) {
      return NextResponse.json({ error: 'One of the chosen times is not valid.' }, { status: 400 });
    }
    const dateKeys = chosen.map(londonDateKey);
    if (new Set(dateKeys).size !== dateKeys.length) {
      return NextResponse.json({ error: 'Each day can only be picked once.' }, { status: 400 });
    }
    if (bundle.days < promotion.weekendMinDays && chosen.some((s) => isWeekendInLondon(s))) {
      return NextResponse.json(
        { error: `Weekend days are only available in blocks of ${promotion.weekendMinDays} days or more.` },
        { status: 400 }
      );
    }

    // Every start must be a currently free slot on the offer full day.
    const eventTypeId = await getEventTypeId(BLOCK_EVENT_PACKAGE_ID);
    if (!eventTypeId) {
      console.error(`Cal.com event type "${BLOCK_EVENT_PACKAGE_ID}" not found`);
      return NextResponse.json({ error: 'Online booking is being set up.' }, { status: 503 });
    }
    // The end bound is padded a day in case Cal.com treats it as exclusive.
    const free = await getAvailableSlots(eventTypeId, dateKeys[0], addDaysToKey(dateKeys[dateKeys.length - 1], 1));
    const freeSet = new Set(Object.values(free).flat());
    const taken = chosen.filter((s) => !freeSet.has(s));
    if (taken.length) {
      return NextResponse.json(
        {
          error: `Sorry, ${taken.map(formatDay).join(', ')} ${taken.length === 1 ? 'is' : 'are'} no longer available. Please pick again.`,
          unavailable: taken,
        },
        { status: 409 }
      );
    }

    // ── Hold every day in Cal.com (all or nothing) ───────────────────────────
    const results = await Promise.allSettled(
      chosen.map((start) => createCalBooking({ eventTypeId, start, name, email, notes }))
    );
    const held = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
    if (held.length !== chosen.length) {
      console.error(
        'Block booking: could not hold every day, releasing',
        results.filter((r) => r.status === 'rejected').map((r) => String((r as PromiseRejectedResult).reason))
      );
      await Promise.all(held.map((b) => cancelCalBooking(b.uid, 'Block booking could not be completed')));
      return NextResponse.json(
        { error: 'One of those days was just taken. Please pick your dates again.' },
        { status: 409 }
      );
    }
    held.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

    // ── Money, computed here and nowhere else ────────────────────────────────
    const totalPrice = bundle.price;
    const deposit = Math.round(calculateDeposit(totalPrice) * 100) / 100;
    const balanceDue = Math.round((totalPrice - deposit) * 100) / 100;
    const addonsTotal = Math.round(extraBackdrops * promotion.extraBackdropPrice * 100) / 100;
    const addonsSummary = extraBackdrops
      ? `${extraBackdrops}× extra backdrop (£${addonsTotal.toFixed(2)})`
      : '';

    const title = `${bundle.days}-day block booking (special offer)`;
    const dayList = chosen.map(formatDay).join(', ');

    const pending = await savePendingBooking({
      id: `pending_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      calBookingUid: held[0].uid,
      extraCalBookingUids: held.slice(1).map((b) => b.uid),
      customerName: name,
      customerEmail: email,
      startTime: held[0].start,
      endTime: held[held.length - 1].end,
      bookingData: {
        packageId: `block-${bundle.days}`,
        packageTitle: title,
        totalPrice,
        depositAmount: deposit,
        addonsTotal,
        addonsSummary,
      },
    });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' });
    let session: Stripe.Checkout.Session;
    try {
      const addonsNote = addonsSummary ? ` Extra backdrops (£${addonsTotal.toFixed(2)}) due on the day.` : '';
      session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: title,
                description: `Deposit for ${bundle.days} full days: ${dayList}.${addonsNote}`.slice(0, 1000),
              },
              unit_amount: Math.round(deposit * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: email,
        expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_WINDOW_MINUTES * 60,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book-online?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book-online?cancelled=true`,
        metadata: {
          customerName: name,
          customerEmail: email,
          bookingDate: dayList.slice(0, 480),
          bookingHours: `${bundle.days} full days (8 hours each)`,
          bookingNotes: notes,
          totalPrice: totalPrice.toFixed(2),
          depositAmount: deposit.toFixed(2),
          balanceDue: balanceDue.toFixed(2),
          addonsTotal: addonsTotal.toFixed(2),
          addonsSummary,
          selectedPackage: `block-${bundle.days}`,
          packageTitle: title,
          pendingBookingId: pending.id,
          calBookingUid: held[0].uid,
        },
      });
    } catch (error) {
      await cancelPendingBooking(pending.id, 'Checkout could not be started');
      throw error;
    }

    await updatePendingBookingStripeSession(pending.id, session.id).catch((error) =>
      console.error('Error linking block booking to Stripe session:', error)
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Block checkout error:', error);
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 });
  }
}

const dayFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

function formatDay(iso: string): string {
  return dayFmt.format(new Date(iso));
}
