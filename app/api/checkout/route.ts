import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { calculateHours, calculatePrice, calculateDeposit } from '@/lib/pricing';
import { getPendingBooking, updatePendingBookingStripeSession } from '@/lib/pendingBookings';

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });
    const body = await request.json();
    const { 
      name, 
      email, 
      date, 
      hours, 
      notes, 
      startTime, 
      endTime, 
      totalPrice, 
      depositAmount,
      selectedPackage,
      packageTitle,
      pendingBookingId,
      calendlyEventUri,
      calendlyInviteeUri
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email' },
        { status: 400 }
      );
    }

    if (!date || !hours) {
      return NextResponse.json(
        { error: 'Missing required fields: date, hours' },
        { status: 400 }
      );
    }

    // Calculate pricing if not provided
    let bookingTotalPrice = totalPrice;
    let bookingDeposit = depositAmount;

    if (!bookingTotalPrice || !bookingDeposit) {
      // Try to calculate from startTime/endTime (fallback)
      if (startTime && endTime) {
        const calculatedHours = calculateHours(startTime, endTime);
        bookingTotalPrice = calculatePrice(calculatedHours);
        bookingDeposit = calculateDeposit(bookingTotalPrice);
      } else {
        return NextResponse.json(
          { error: 'Missing pricing information. Please select a package or provide totalPrice and depositAmount.' },
          { status: 400 }
        );
      }
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp', // British Pounds
            product_data: {
              name: packageTitle || 'Studio Booking Deposit',
              description: `50% deposit for ${packageTitle || 'studio booking'}${date ? ` on ${date}` : ''}${hours ? ` (${hours})` : ''}`,
            },
            unit_amount: Math.round(bookingDeposit * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book-online?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book-online?canceled=true`,
      metadata: {
        customerName: name,
        customerEmail: email,
        bookingDate: date || '',
        bookingHours: hours || '',
        bookingNotes: notes || '',
        totalPrice: bookingTotalPrice.toString(),
        depositAmount: bookingDeposit.toString(),
        balanceDue: (bookingTotalPrice - bookingDeposit).toString(),
        startTime: startTime || '',
        endTime: endTime || '',
        selectedPackage: selectedPackage || '',
        packageTitle: packageTitle || '',
        pendingBookingId: pendingBookingId || '',
        calendlyEventUri: calendlyEventUri || '',
        calendlyInviteeUri: calendlyInviteeUri || '',
      },
    });

    // If we have a pending booking, update it with the Stripe session ID
    if (pendingBookingId) {
      try {
        await updatePendingBookingStripeSession(pendingBookingId, session.id);
      } catch (error) {
        console.error("Error updating pending booking with Stripe session:", error);
        // Don't fail the checkout if this fails
      }
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
