import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  calculateHours,
  computeAddonsTotal,
  getBalanceForPackage,
  getDepositForPackage,
  getPackagePriceForHours,
  type SelectedAddon,
} from '@/lib/pricing';
import { getMergedPackages } from '@/lib/admin/pricing-merged';
import { getCalBooking } from '@/lib/calcom';
import { updatePendingBookingStripeSession, CHECKOUT_WINDOW_MINUTES } from '@/lib/pendingBookings';
import { validateDiscountCode } from '@/lib/admin/validateDiscount';

/**
 * Creates the Stripe Checkout session for a booking deposit.
 *
 * Every number charged here is computed on the server. The browser supplies
 * only *identifiers* — which package, which add-ons, which Cal.com booking —
 * and the authoritative start/end times come from Cal.com, not the client.
 * Nothing in the request body can influence the amount charged.
 */
export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });

    const body = await request.json();
    const {
      notes,
      selectedPackage: selectedPackageId,
      selectedAddons,
      pendingBookingId,
      calBookingUid,
      discountCode,
    } = body ?? {};

    if (typeof calBookingUid !== 'string' || !calBookingUid) {
      return NextResponse.json({ error: 'Missing booking reference.' }, { status: 400 });
    }
    if (typeof selectedPackageId !== 'string' || !selectedPackageId) {
      return NextResponse.json({ error: 'Please choose an option first.' }, { status: 400 });
    }

    // ── Authoritative booking, straight from Cal.com ──────────────────────────
    const booking = await getCalBooking(calBookingUid);
    if (!booking) {
      return NextResponse.json(
        { error: 'We could not find that time slot. Please pick a time again.' },
        { status: 400 }
      );
    }
    if (booking.status !== 'pending') {
      // Already confirmed (so already paid) or cancelled/rejected. Either way
      // this is not something we should be taking money for.
      return NextResponse.json(
        { error: 'That time slot is no longer being held. Please pick a time again.' },
        { status: 409 }
      );
    }

    const attendee = booking.attendees?.[0];
    const name = attendee?.name?.trim();
    const email = attendee?.email?.trim().toLowerCase();
    if (!name || !email) {
      return NextResponse.json(
        { error: 'The booking is missing a name or email. Please pick a time again.' },
        { status: 400 }
      );
    }

    // ── Authoritative package, including any admin price override ────────────
    const packages = await getMergedPackages();
    const pkg = packages.find((p) => p.id === selectedPackageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Unknown package.' }, { status: 400 });
    }
    if (!pkg.enabled) {
      return NextResponse.json(
        { error: 'That option is not currently available.' },
        { status: 400 }
      );
    }

    // ── Price, computed here and nowhere else ────────────────────────────────
    const hours = pkg.priceFromTime
      ? calculateHours(booking.start, booking.end, pkg.minimumHours)
      : pkg.hours;

    const packagePrice = getPackagePriceForHours(pkg, hours);

    // Re-derive add-on money from the submitted *selection*, never a submitted total.
    const requestedAddons: SelectedAddon[] = Array.isArray(selectedAddons)
      ? selectedAddons
          .filter((a: unknown): a is SelectedAddon =>
            typeof a === 'object' && a !== null && typeof (a as SelectedAddon).id === 'string'
          )
          .map((a) => ({
            id: a.id,
            quantity: Number.isFinite(Number(a.quantity)) ? Math.max(0, Math.floor(Number(a.quantity))) : 1,
          }))
      : [];
    const { total: addonsTotal, summary: addonsSummary } = computeAddonsTotal(requestedAddons);

    let totalPrice = packagePrice + addonsTotal;
    let deposit = getDepositForPackage(pkg, packagePrice);

    // ── Discount, applied to the server-computed price ───────────────────────
    let appliedDiscountCode = '';
    let discountAmount = 0;
    if (typeof discountCode === 'string' && discountCode) {
      const validation = await validateDiscountCode(discountCode, pkg.id, packagePrice, pkg);
      if (validation.valid) {
        discountAmount = validation.discountAmount;
        totalPrice = validation.finalPrice + addonsTotal;
        deposit = validation.finalDeposit;
        appliedDiscountCode = validation.code;
      }
    }

    const balanceDue = getBalanceForPackage(pkg, totalPrice, deposit);

    if (!Number.isFinite(deposit) || deposit <= 0) {
      console.error('Computed a non-chargeable deposit', { pkg: pkg.id, hours, totalPrice, deposit });
      return NextResponse.json({ error: 'Unable to price that booking.' }, { status: 400 });
    }

    // ── Human-readable date/time, derived from the booking ───────────────────
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      dateStyle: 'full',
    });
    const timeFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      hour: 'numeric',
      minute: '2-digit',
    });
    const bookingDate = fmt.format(new Date(booking.start));
    const bookingHours = `${timeFmt.format(new Date(booking.start))} – ${timeFmt.format(
      new Date(booking.end)
    )}`;

    const addonsNote = addonsSummary ? ` Add-ons (£${addonsTotal}) due on the day.` : '';
    const depositDescription =
      `Deposit for ${pkg.title} on ${bookingDate} (${bookingHours})` + addonsNote;

    const session = await stripe.checkout.sessions.create({
      // Omitting payment_method_types lets Stripe show every method enabled in
      // the Dashboard (card + Apple Pay / Google Pay / Link).
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: pkg.title, description: depositDescription },
            unit_amount: Math.round(deposit * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      // Close the session when the hold's payment window does; Stripe then
      // sends checkout.session.expired and the webhook releases the slot.
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_WINDOW_MINUTES * 60,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book-online?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book-online?cancelled=true`,
      metadata: {
        customerName: name,
        customerEmail: email,
        bookingDate,
        bookingHours,
        bookingNotes: typeof notes === 'string' ? notes.slice(0, 500) : '',
        totalPrice: totalPrice.toFixed(2),
        depositAmount: deposit.toFixed(2),
        balanceDue: balanceDue.toFixed(2),
        addonsTotal: String(addonsTotal),
        addonsSummary,
        selectedPackage: pkg.id,
        packageTitle: pkg.title,
        pendingBookingId: typeof pendingBookingId === 'string' ? pendingBookingId : '',
        calBookingUid,
        discountCode: appliedDiscountCode,
        discountAmount: discountAmount.toFixed(2),
      },
    });

    if (pendingBookingId) {
      try {
        await updatePendingBookingStripeSession(pendingBookingId, session.id);
      } catch (error) {
        console.error('Error updating pending booking with Stripe session:', error);
        // Don't fail the checkout: the webhook can still find the booking by uid.
      }
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
