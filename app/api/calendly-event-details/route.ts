import { NextResponse } from 'next/server';

const CALENDLY_API_BASE = 'https://api.calendly.com';

export async function POST(request: Request) {
  try {
    // Check if token is configured
    if (!process.env.CALENDLY_API_TOKEN) {
      console.error('CALENDLY_API_TOKEN not set in environment variables');
      return NextResponse.json(
        { error: 'Calendly API token not configured. Please set CALENDLY_API_TOKEN in your environment variables.' },
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

    console.log('Fetching Calendly event details:', { eventUri, inviteeUri });

    // Fetch event details
    const eventResponse = await fetch(eventUri, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!eventResponse.ok) {
      const errorText = await eventResponse.text();
      console.error('Failed to fetch Calendly event:', {
        status: eventResponse.status,
        statusText: eventResponse.statusText,
        error: errorText,
        eventUri,
      });
      return NextResponse.json(
        { error: `Failed to fetch event: ${eventResponse.status} ${eventResponse.statusText}`, details: errorText },
        { status: eventResponse.status }
      );
    }

    const eventData = await eventResponse.json();
    console.log('Event data received:', JSON.stringify(eventData).substring(0, 200));

    // Fetch invitee details
    const inviteeResponse = await fetch(inviteeUri, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!inviteeResponse.ok) {
      const errorText = await inviteeResponse.text();
      console.error('Failed to fetch Calendly invitee:', {
        status: inviteeResponse.status,
        statusText: inviteeResponse.statusText,
        error: errorText,
        inviteeUri,
      });
      return NextResponse.json(
        { error: `Failed to fetch invitee: ${inviteeResponse.status} ${inviteeResponse.statusText}`, details: errorText },
        { status: inviteeResponse.status }
      );
    }

    const inviteeData = await inviteeResponse.json();
    console.log('Invitee data received:', JSON.stringify(inviteeData).substring(0, 200));

    // Extract data from Calendly API response structure
    // Calendly API returns { resource: { ... } } structure
    const eventResource = eventData.resource || eventData;
    const inviteeResource = inviteeData.resource || inviteeData;

    // Combine the data
    const result = {
      start_time: eventResource.start_time,
      end_time: eventResource.end_time,
      event_type: eventResource.event_type,
      invitee: {
        email: inviteeResource.email,
        name: inviteeResource.name,
      },
    };

    console.log('Returning combined data:', JSON.stringify(result).substring(0, 200));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching Calendly event details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch event details', details: errorMessage },
      { status: 500 }
    );
  }
}

