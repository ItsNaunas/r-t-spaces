import { Resend } from 'resend';

interface BookingData {
  name: string;
  email: string;
  date?: string;
  hours?: string;
  notes?: string;
  calendlyLink?: string | null;
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
    await resend.emails.send({
      from: fromEmail,
      to: studioEmail,
      subject: `New Booking Request from ${booking.name}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        ${booking.date ? `<p><strong>Date:</strong> ${booking.date}</p>` : ''}
        ${booking.hours ? `<p><strong>Hours:</strong> ${booking.hours}</p>` : ''}
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
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
        ? 'Booking Confirmed - Confirm Your Time - R&T Spaces'
        : 'Booking Request Received - R&T Spaces',
      html: `
        <h2>${booking.calendlyLink ? 'Booking Confirmed!' : 'Thank you for your booking request!'}</h2>
        <p>Hi ${booking.name},</p>
        ${booking.calendlyLink 
          ? '<p>Your payment was successful and your booking has been confirmed!</p>'
          : '<p>We\'ve received your booking request and will get back to you shortly.</p>'
        }
        ${booking.date ? `<p><strong>Requested Date:</strong> ${booking.date}</p>` : ''}
        ${booking.hours ? `<p><strong>Requested Hours:</strong> ${booking.hours}</p>` : ''}
        ${calendlySection}
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>Best regards,<br>R&T Spaces Team</p>
      `,
    });

    console.log('Email notifications sent successfully');
  } catch (error) {
    console.error('Failed to send email notifications:', error);
    throw error;
  }
}
