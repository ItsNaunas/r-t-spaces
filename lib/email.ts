import { Resend } from 'resend';

interface BookingData {
  name: string;
  email: string;
  date?: string;
  hours?: string;
  notes?: string;
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
    await resend.emails.send({
      from: fromEmail,
      to: booking.email,
      subject: 'Booking Request Received - R&T Spaces',
      html: `
        <h2>Thank you for your booking request!</h2>
        <p>Hi ${booking.name},</p>
        <p>We've received your booking request and will get back to you shortly.</p>
        ${booking.date ? `<p><strong>Requested Date:</strong> ${booking.date}</p>` : ''}
        ${booking.hours ? `<p><strong>Requested Hours:</strong> ${booking.hours}</p>` : ''}
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
