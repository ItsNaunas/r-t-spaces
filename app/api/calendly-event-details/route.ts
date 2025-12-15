import { NextResponse } from 'next/server';

const CALENDLY_API_BASE = 'https://api.calendly.com';

export async function POST(request: Request) {
  try {
    if (!process.env.CALENDLY_API_TOKEN) {
      return NextResponse.json(
        { error: 'Calendly API token not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { eventUri, inviteeUri } = body;

    if (!eventUri || !inviteeUri) {
      return NextResponse.json(
        { error: 'Missing eventUri or inviteeUri' },
        { status: 400 }
      );
    }

    // Fetch event details
    const eventResponse = await fetch(eventUri, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!eventResponse.ok) {
      throw new Error(`Failed to fetch event: ${eventResponse.statusText}`);
    }

    const eventData = await eventResponse.json();

    // Fetch invitee details
    const inviteeResponse = await fetch(inviteeUri, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!inviteeResponse.ok) {
      throw new Error(`Failed to fetch invitee: ${inviteeResponse.statusText}`);
    }

    const inviteeData = await inviteeResponse.json();

    // Combine the data
    return NextResponse.json({
      start_time: eventData.resource?.start_time,
      end_time: eventData.resource?.end_time,
      event_type: eventData.resource?.event_type,
      invitee: {
        email: inviteeData.resource?.email,
        name: inviteeData.resource?.name,
      },
    });
  } catch (error) {
    console.error('Error fetching Calendly event details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event details' },
      { status: 500 }
    );
  }
}

