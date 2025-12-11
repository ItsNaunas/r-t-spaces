import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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
    const { amount, name, email, date, hours, notes } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email' },
        { status: 400 }
      );
    }

    // Use default amount if not provided (you can adjust this)
    const bookingAmount = amount || 100; // Default to $100 if not specified

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Studio Booking',
              description: `Booking for ${name}`,
            },
            unit_amount: Math.round(bookingAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book-online?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book-online?canceled=true`,
      metadata: {
        customerName: name,
        customerEmail: email,
        bookingDate: date || '',
        bookingHours: hours || '',
        bookingNotes: notes || '',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
