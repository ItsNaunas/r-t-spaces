import { Resend } from 'resend';

interface BookingData {
  name: string;
  email: string;
  date?: string;
  hours?: string;
  notes?: string;
  /** True for bookings paid through Stripe; false/absent for enquiries. */
  paid?: boolean;
  totalPrice?: string;
  depositAmount?: string;
  balanceDue?: string;
  addonsSummary?: string;
  addonsTotal?: string;
}

/** Customer-supplied text goes into HTML email: escape it. */
function esc(value: string | undefined): string {
  return (value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  );
}

export async function sendBookingNotification(raw: BookingData) {
  // Paid status used to be inferred from a Calendly link, which no longer exists.
  const paid = Boolean(raw.paid);
  const booking = {
    ...raw,
    name: esc(raw.name),
    email: esc(raw.email),
    date: raw.date && esc(raw.date),
    hours: raw.hours && esc(raw.hours),
    notes: raw.notes && esc(raw.notes),
    addonsSummary: raw.addonsSummary && esc(raw.addonsSummary),
  };
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email notification');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const studioEmail = process.env.STUDIO_EMAIL || 'enquires@rtspaces.co.uk';
  const fromEmail = process.env.FROM_EMAIL || 'notifications@rtspaces.co.uk';

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
      subject: `New Booking ${paid ? '(Paid)' : 'Request'} from ${booking.name}`,
      html: `
        <h2>New Booking ${paid ? '(Paid)' : 'Request'}</h2>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        ${booking.date ? `<p><strong>Date:</strong> ${booking.date}</p>` : ''}
        ${booking.hours ? `<p><strong>Hours:</strong> ${booking.hours}</p>` : ''}
        ${pricingSection}
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
      `,
    });

    // Send confirmation to customer
    await resend.emails.send({
      from: fromEmail,
      to: raw.email,
      subject: paid
        ? 'Booking Confirmed - RT Spaces'
        : 'Booking Request Received - RT Spaces',
      html: `
        <h2>${paid ? 'Booking Confirmed!' : 'Thank you for your booking request!'}</h2>
        <p>Hi ${booking.name},</p>
        ${paid
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
              <li>Balance Due: £${parseFloat(booking.balanceDue || '0').toFixed(2)}${booking.addonsSummary ? ' (due before your session begins, includes add-ons)' : ' (due before your session begins)'}</li>
            </ul>
          </div>
        ` : ''}
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
  const studioEmail = process.env.STUDIO_EMAIL || 'enquires@rtspaces.co.uk';
  const fromEmail = process.env.FROM_EMAIL || 'notifications@rtspaces.co.uk';

  await resend.emails.send({
    from: fromEmail,
    to: studioEmail,
    subject: 'New Creator Circle signup',
    html: `<h2>New newsletter signup</h2><p><strong>Email:</strong> ${email}</p>`,
  });
}
