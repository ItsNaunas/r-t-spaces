/**
 * Calendly API Helper
 * 
 * Note: Calendly API requires authentication via Personal Access Token
 * Get your token from: https://calendly.com/integrations/api_webhooks
 * 
 * Environment variable needed:
 * - CALENDLY_API_TOKEN: Your Calendly Personal Access Token
 */

const CALENDLY_API_BASE = 'https://api.calendly.com';

interface CreateEventInviteeParams {
  eventTypeUri: string;
  email: string;
  name: string;
  startTime: string; // ISO 8601 format
  timezone?: string;
  notes?: string;
}

interface CalendlyEventResponse {
  resource: {
    uri: string;
    name: string;
    status: string;
    start_time: string;
    end_time: string;
    event_type: string;
    location: {
      type: string;
      location: string;
    };
    invitees_counter: {
      total: number;
      active: number;
      limit: number;
    };
    created_at: string;
    updated_at: string;
  };
}

/**
 * Create a Calendly event invitee (scheduled event)
 * This creates a booking in Calendly after payment is confirmed
 */
export async function createCalendlyEventInvitee(
  params: CreateEventInviteeParams
): Promise<{ eventUri: string; inviteeUri: string } | null> {
  if (!process.env.CALENDLY_API_TOKEN) {
    console.warn('CALENDLY_API_TOKEN not set - cannot create Calendly event');
    return null;
  }

  try {
    const response = await fetch(`${CALENDLY_API_BASE}/scheduled_events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: params.eventTypeUri,
        invitee: {
          email: params.email,
          name: params.name,
          timezone: params.timezone || 'UTC',
        },
        start_time: params.startTime,
        end_time: new Date(new Date(params.startTime).getTime() + 2 * 60 * 60 * 1000).toISOString(), // Default 2 hours (minimum booking)
        location: {
          type: 'physical',
          location: 'Studio', // Update with your studio address
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Calendly API error:', response.status, errorText);
      throw new Error(`Failed to create Calendly event: ${response.statusText}`);
    }

    const data: CalendlyEventResponse = await response.json();
    
    // Get the invitee URI from the event
    const inviteeUri = data.resource.uri; // This might need adjustment based on actual API response
    
    return {
      eventUri: data.resource.uri,
      inviteeUri: inviteeUri, // You may need to extract this from the response differently
    };
  } catch (error) {
    console.error('Error creating Calendly event:', error);
    // Don't throw - return null so booking can still be saved
    return null;
  }
}

/**
 * Cancel a Calendly scheduled event
 */
export async function cancelCalendlyEvent(eventUri: string, reason?: string): Promise<boolean> {
  if (!process.env.CALENDLY_API_TOKEN) {
    console.warn('CALENDLY_API_TOKEN not set - cannot cancel Calendly event');
    return false;
  }

  try {
    // Extract event UUID from URI
    const eventId = eventUri.split('/').pop();
    if (!eventId) {
      console.error('Invalid Calendly event URI:', eventUri);
      return false;
    }

    const response = await fetch(`${CALENDLY_API_BASE}/scheduled_events/${eventId}/cancellation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: reason || 'Payment failed or cancelled',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Calendly cancellation error:', response.status, errorText);
      return false;
    }

    console.log('Calendly event cancelled successfully:', eventId);
    return true;
  } catch (error) {
    console.error('Error cancelling Calendly event:', error);
    return false;
  }
}

/**
 * Get event type URI from scheduling link
 * This extracts the event type from a Calendly scheduling URL
 */
export function getEventTypeUriFromSchedulingLink(schedulingLink: string): string | null {
  try {
    // Calendly scheduling links look like: https://calendly.com/username/event-type-name
    // Event type URI format: https://api.calendly.com/event_types/{uuid}
    // We need to get the UUID from the scheduling link
    
    // For now, we'll need to get this from Calendly API or store it in env
    // This is a placeholder - you'll need to implement based on your Calendly setup
    
    // Option 1: Store event type URI in env variable
    if (process.env.CALENDLY_EVENT_TYPE_URI) {
      return process.env.CALENDLY_EVENT_TYPE_URI;
    }
    
    // Option 2: Extract from scheduling link (requires API call to get event types)
    // This would require an additional API call to list event types
    
    return null;
  } catch (error) {
    console.error('Error extracting event type URI:', error);
    return null;
  }
}

/**
 * Alternative: Create event using Calendly Scheduling Links API
 * This is simpler but requires the event type to be configured
 */
export async function createCalendlyBookingViaSchedulingLink(
  email: string,
  name: string,
  startTime: string,
  schedulingLink: string
): Promise<{ eventUri: string; inviteeUri: string } | null> {
  // This approach uses Calendly's scheduling link directly
  // The actual implementation depends on Calendly's API structure
  
  // For now, we'll use the event creation method above
  // You may need to adjust based on your specific Calendly setup
  
  const eventTypeUri = getEventTypeUriFromSchedulingLink(schedulingLink);
  if (!eventTypeUri) {
    console.error('Could not determine event type URI from scheduling link');
    return null;
  }

  return createCalendlyEventInvitee({
    eventTypeUri,
    email,
    name,
    startTime,
  });
}


