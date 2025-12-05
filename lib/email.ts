import { Resend } from "resend";
import type { BookingEntry } from "./bookingStore";

const resend = new Resend(process.env.RESEND_API_KEY);

const STUDIO_EMAIL = process.env.STUDIO_EMAIL || "Teddy77723@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

export async function sendBookingNotification(booking: BookingEntry) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email notification");
    return;
  }

  try {
    // Email to studio
    await resend.emails.send({
      from: FROM_EMAIL,
      to: STUDIO_EMAIL,
      subject: `New Booking Request from ${booking.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Booking Request</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${booking.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${booking.email}">${booking.email}</a></p>
            ${booking.date ? `<p><strong>Preferred Date:</strong> ${new Date(booking.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
            ${booking.hours ? `<p><strong>Hours Needed:</strong> ${booking.hours}</p>` : ''}
            ${booking.notes ? `<p><strong>Notes:</strong><br>${booking.notes.replace(/\n/g, '<br>')}</p>` : ''}
            <p><strong>Submitted:</strong> ${new Date(booking.createdAt).toLocaleString('en-GB')}</p>
          </div>
          <p style="color: #666; font-size: 14px;">
            Please respond within 24 hours to confirm availability.
          </p>
        </div>
      `,
    });

    // Confirmation email to customer
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.email,
      replyTo: STUDIO_EMAIL,
      subject: "Booking Request Received - R&T Space",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for your booking request!</h2>
          <p>Hi ${booking.name},</p>
          <p>We've received your booking request and will confirm availability within 24 hours.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Request Details:</h3>
            ${booking.date ? `<p><strong>Preferred Date:</strong> ${new Date(booking.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
            ${booking.hours ? `<p><strong>Hours Needed:</strong> ${booking.hours}</p>` : ''}
            ${booking.notes ? `<p><strong>Notes:</strong><br>${booking.notes.replace(/\n/g, '<br>')}</p>` : ''}
          </div>
          <p>For last-minute bookings (within 48 hours), please DM us on <a href="https://www.instagram.com/randtspace" style="color: #007bff;">Instagram @randtspace</a>.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            R&T Space Team<br>
            <a href="mailto:${STUDIO_EMAIL}">${STUDIO_EMAIL}</a><br>
            <a href="tel:07944667000">07944667000</a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send booking emails:", error);
    // Don't throw - we still want to save the booking even if email fails
  }
}

