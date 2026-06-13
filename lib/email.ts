import { Resend } from 'resend';

interface BookingData {
  name: string;
  email: string;
  date?: string;
  hours?: string;
  notes?: string;
  calendlyLink?: string | null;
  totalPrice?: string;
  depositAmount?: string;
  balanceDue?: string;
  addonsSummary?: string;
  addonsTotal?: string;
}

export async function sendBookingNotification(booking: BookingData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email notification');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const studioEmail = process.env.STUDIO_EMAIL || 'studio@rtspaces.com';
  const fromEmail = process.env.FROM_EMAIL || 'notifications@rtspaces.com';

  try {
    // Send notification to studio
    const addonsLine = booking.addonsSummary
      ? `<li>Add-ons: ${booking.addonsSummary} (£${parseFloat(booking.addonsTotal || '0').toFixed(2)})</li>`
      : '';
    const pricingSection = booking.totalPrice 
      ? `
        <div style="margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-radius: 6px;">
          <p><strong>Pricing:</strong></p>
          <ul style="margin: 5px 0; padding-left: 20px;">
            ${addonsLine}
            <li>Total: £${parseFloat(booking.totalPrice).toFixed(2)}</li>
            <li>Deposit Paid: £${parseFloat(booking.depositAmount || '0').toFixed(2)}</li>
            <li>Balance Due: £${parseFloat(booking.balanceDue || '0').toFixed(2)}${booking.addonsSummary ? ' (includes add-ons)' : ''}</li>
          </ul>
        </div>
      `
      : '';

    await resend.emails.send({
      from: fromEmail,
      to: studioEmail,
      subject: `New Booking ${booking.calendlyLink ? '(Paid)' : 'Request'} from ${booking.name}`,
      html: `
        <h2>New Booking ${booking.calendlyLink ? '(Paid)' : 'Request'}</h2>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        ${booking.date ? `<p><strong>Date:</strong> ${booking.date}</p>` : ''}
        ${booking.hours ? `<p><strong>Hours:</strong> ${booking.hours}</p>` : ''}
        ${pricingSection}
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        ${booking.calendlyLink ? `<p><strong>Calendly Link:</strong> <a href="${booking.calendlyLink}">${booking.calendlyLink}</a></p>` : ''}
      `,
    });

    // Send confirmation to customer
    const calendlySection = booking.calendlyLink 
      ? `
        <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-radius: 8px; border: 2px solid #0ea5e9;">
          <h3 style="margin-top: 0; color: #0c4a6e;">📅 Confirm Your Booking Time</h3>
          <p>Your payment was successful! Please click the link below to confirm your booking time in our calendar:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${booking.calendlyLink}" 
               style="display: inline-block; padding: 12px 24px; background-color: #0069ff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Confirm Booking Time
            </a>
          </p>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Or copy this link: ${booking.calendlyLink}</p>
        </div>
      `
      : '';

    await resend.emails.send({
      from: fromEmail,
      to: booking.email,
      subject: booking.calendlyLink 
        ? 'Booking Confirmed - Confirm Your Time - RT Spaces'
        : 'Booking Request Received - RT Spaces',
      html: `
        <h2>${booking.calendlyLink ? 'Booking Confirmed!' : 'Thank you for your booking request!'}</h2>
        <p>Hi ${booking.name},</p>
        ${booking.calendlyLink 
          ? '<p>Your payment was successful and your booking has been confirmed!</p>'
          : '<p>We\'ve received your booking request and will get back to you shortly.</p>'
        }
        ${booking.date ? `<p><strong>Requested Date:</strong> ${booking.date}</p>` : ''}
        ${booking.hours ? `<p><strong>Requested Hours:</strong> ${booking.hours}</p>` : ''}
        ${booking.totalPrice ? `
          <div style="margin: 15px 0; padding: 10px; background-color: #f0f9ff; border-radius: 6px;">
            <p><strong>Payment Summary:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${booking.addonsSummary ? `<li>Add-ons: ${booking.addonsSummary}</li>` : ''}
              <li>Total Price: £${parseFloat(booking.totalPrice).toFixed(2)}</li>
              <li>Deposit Paid: £${parseFloat(booking.depositAmount || '0').toFixed(2)}</li>
              <li>Balance Due: £${parseFloat(booking.balanceDue || '0').toFixed(2)}${booking.addonsSummary ? ' (on the day, includes add-ons)' : ' (48h before booking)'}</li>
            </ul>
          </div>
        ` : ''}
        ${calendlySection}
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>Best regards,<br>RT Spaces Team</p>
      `,
    });

    console.log('Email notifications sent successfully');
  } catch (error) {
    console.error('Failed to send email notifications:', error);
    throw error;
  }
}

export async function subscribeToNewsletter(email: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping newsletter subscription');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  // Add to the Resend audience when one is configured.
  if (audienceId) {
    try {
      await resend.contacts.create({ email, audienceId, unsubscribed: false });
    } catch (error) {
      console.error('Failed to add contact to Resend audience:', error);
    }
  }

  // Always notify the studio so a signup is never lost, even without an audience.
  const studioEmail = process.env.STUDIO_EMAIL || 'studio@rtspaces.com';
  const fromEmail = process.env.FROM_EMAIL || 'notifications@rtspaces.com';

  await resend.emails.send({
    from: fromEmail,
    to: studioEmail,
    subject: 'New Creator Circle signup',
    html: `<h2>New newsletter signup</h2><p><strong>Email:</strong> ${email}</p>`,
  });
}
