import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { saveBooking } from '@/lib/bookingStore';
import { sendBookingNotification } from '@/lib/email';
import { createCalendlyEvent } from '@/lib/calendly';

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

          // Create Calendly scheduling link (non-blocking - don't fail if it fails)
          const calendlyLink = await createCalendlyEvent(savedBooking).catch((error) => {
            console.error('Calendly link generation failed (booking still saved):', error);
            return null;
          });

          // Send email notifications with Calendly link (non-blocking - don't fail if email fails)
          sendBookingNotification({
            ...savedBooking,
            calendlyLink,
          }).catch((error) => {
            console.error('Email notification failed (booking still saved):', error);
          });

          console.log('Booking processed successfully', calendlyLink ? 'with Calendly link' : '');
        } catch (error) {
          console.error('Error processing booking:', error);
          // Don't throw - webhook should still return success to Stripe
          // Log the error for manual processing
        }
        
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent successful:', paymentIntent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', paymentIntent.id);
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
