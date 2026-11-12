import { Resend } from 'resend';

interface BookingData {
  name: string;
  email: string;
  date?: string;
  hours?: string;
  notes?: string;
  /** True for bookings paid through Stripe; false/absent for enquiries. */
  paid?: boolean;
  /**
   * Paid bookings only: whether every Cal.com hold was confirmed. False means
   * the money is in but the slot is not secured, and the studio must act.
   */
  calConfirmed?: boolean;
  calBookingUids?: string[];
  packageTitle?: string;
  stripeUrl?: string;
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

function mailer() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email notification');
    return null;
  }
  return {
    resend: new Resend(process.env.RESEND_API_KEY),
    studioEmail: process.env.STUDIO_EMAIL || 'enquires@rtspaces.co.uk',
    fromEmail: process.env.FROM_EMAIL || 'notifications@rtspaces.co.uk',
  };
}

type Mailer = NonNullable<ReturnType<typeof mailer>>;
type Message = { to: string; subject: string; html: string; replyTo?: string };

/**
 * Send every message independently, so a failed studio email can never stop
 * the customer's (it used to: the sends were sequential awaits). Resend
 * returns API failures as `{ error }` rather than throwing, so check both.
 * Throws once at the end if anything failed, for the caller to log.
 */
async function sendAll(m: Mailer, messages: Message[]) {
  const results = await Promise.allSettled(
    messages.map(async (msg) => {
      const { error } = await m.resend.emails.send({ from: m.fromEmail, ...msg });
      if (error) throw new Error(`${msg.subject} -> ${error.name}: ${error.message}`);
    })
  );
  const failed = results.flatMap((r) => (r.status === 'rejected' ? [String(r.reason)] : []));
  if (failed.length) throw new Error(`Email send failed: ${failed.join(' | ')}`);
}

export async function sendBookingNotification(raw: BookingData) {
  // Paid status used to be inferred from a Calendly link, which no longer exists.
  const paid = Boolean(raw.paid);
  // Only an explicit false means "paid but not secured"; enquiries have no slot.
  const unconfirmed = paid && raw.calConfirmed === false;
  const booking = {
    ...raw,
    name: esc(raw.name),
    email: esc(raw.email),
    date: raw.date && esc(raw.date),
    hours: raw.hours && esc(raw.hours),
    notes: raw.notes && esc(raw.notes),
    addonsSummary: raw.addonsSummary && esc(raw.addonsSummary),
    packageTitle: raw.packageTitle && esc(raw.packageTitle),
  };
  const m = mailer();
  if (!m) return;

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
  const actionNeeded = unconfirmed
    ? `
      <div style="margin: 15px 0; padding: 12px; background-color: #fdecea; border: 1px solid #f5c2c0; border-radius: 6px;">
        <p><strong>ACTION NEEDED:</strong> the deposit has been paid, but the booking could not be
        confirmed in Cal.com automatically, so the slot is not secured yet.</p>
        <p>Open Cal.com → Bookings → Unconfirmed and confirm it.
        ${raw.calBookingUids?.length ? `Cal.com booking id(s): ${esc(raw.calBookingUids.join(', '))}.` : ''}</p>
      </div>
    `
    : '';
  const stripeLink = raw.stripeUrl
    ? `<p><a href="${esc(raw.stripeUrl)}">View the payment in Stripe</a></p>`
    : '';

  const studioSubject = unconfirmed
    ? `ACTION NEEDED: paid but NOT confirmed in Cal.com - ${booking.name}`
    : `New Booking ${paid ? '(Paid)' : 'Request'} from ${booking.name}`;

  const customerHeading = !paid
    ? 'Thank you for your booking request!'
    : unconfirmed
      ? 'Deposit received'
      : 'Booking Confirmed!';
  const customerIntro = !paid
    ? "<p>We've received your booking request and will get back to you shortly.</p>"
    : unconfirmed
      ? "<p>Your deposit was received. We're confirming your time now and will be in touch shortly.</p>"
      : '<p>Your payment was successful and your booking has been confirmed!</p>';

  await sendAll(m, [
    {
      to: m.studioEmail,
      // Replying to the notification should reach the customer, not ourselves.
      replyTo: raw.email || undefined,
      subject: studioSubject,
      html: `
        <h2>${unconfirmed ? 'Paid booking - needs confirming' : `New Booking ${paid ? '(Paid)' : 'Request'}`}</h2>
        ${actionNeeded}
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        ${booking.packageTitle ? `<p><strong>Package:</strong> ${booking.packageTitle}</p>` : ''}
        ${booking.date ? `<p><strong>Date:</strong> ${booking.date}</p>` : ''}
        ${booking.hours ? `<p><strong>Hours:</strong> ${booking.hours}</p>` : ''}
        ${pricingSection}
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        ${stripeLink}
      `,
    },
    {
      to: raw.email,
      subject: !paid
        ? 'Booking Request Received - RT Spaces'
        : unconfirmed
          ? 'Deposit Received - RT Spaces'
          : 'Booking Confirmed - RT Spaces',
      html: `
        <h2>${customerHeading}</h2>
        <p>Hi ${booking.name},</p>
        ${customerIntro}
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
              ${paid && parseFloat(booking.balanceDue || '0') > 0 ? "<li>We'll email you a secure link to pay the balance 2 days before your session.</li>" : ''}
            </ul>
          </div>
        ` : ''}
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>Best regards,<br>RT Spaces Team</p>
      `,
    },
  ]);

  console.log('Email notifications sent successfully');
}

interface MembershipData {
  name: string;
  email: string;
  tierName: string;
  monthlyAmount?: string;
  stripeUrl?: string;
}

/** New membership: tell the studio and welcome the member. */
export async function sendMembershipNotification(raw: MembershipData) {
  const m = mailer();
  if (!m) return;
  const name = esc(raw.name);
  const tier = esc(raw.tierName);
  const amount = raw.monthlyAmount ? ` (£${esc(raw.monthlyAmount)}/month)` : '';

  await sendAll(m, [
    {
      to: m.studioEmail,
      replyTo: raw.email || undefined,
      subject: `New Membership: ${tier} - ${name}`,
      html: `
        <h2>New Membership</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${esc(raw.email)}</p>
        <p><strong>Plan:</strong> ${tier}${amount}</p>
        ${raw.stripeUrl ? `<p><a href="${esc(raw.stripeUrl)}">View in Stripe</a></p>` : ''}
      `,
    },
    {
      to: raw.email,
      subject: 'Welcome to RT Spaces Membership',
      html: `
        <h2>Welcome to RT Spaces!</h2>
        <p>Hi ${name},</p>
        <p>Your <strong>${tier}</strong> membership${amount} is active. We'll be in touch with how to book your member sessions.</p>
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>Best regards,<br>RT Spaces Team</p>
      `,
    },
  ]);
}

interface BalanceEmailData {
  name: string;
  email: string;
  /** Pounds, e.g. "15.00". */
  amount: string;
  bookingDate?: string;
  bookingHours?: string;
  packageTitle?: string;
}

function sessionLines(d: BalanceEmailData): string {
  return [
    d.packageTitle ? `<p><strong>Booking:</strong> ${esc(d.packageTitle)}</p>` : '',
    d.bookingDate ? `<p><strong>Date:</strong> ${esc(d.bookingDate)}</p>` : '',
    d.bookingHours ? `<p><strong>Time:</strong> ${esc(d.bookingHours)}</p>` : '',
  ].join('');
}

/**
 * The customer's link to pay the rest before their session. With `reminder`,
 * it's the day-before nudge for a balance that is still unpaid.
 */
export async function sendBalanceLinkEmail(raw: BalanceEmailData & { payUrl: string; reminder?: boolean }) {
  const m = mailer();
  if (!m) return;
  await sendAll(m, [
    {
      to: raw.email,
      subject: raw.reminder
        ? 'Reminder: your RT Spaces balance is due tomorrow'
        : 'Your RT Spaces session: pay your balance',
      html: `
        <h2>${raw.reminder ? 'Your session is tomorrow' : 'Your session is coming up'}</h2>
        <p>Hi ${esc(raw.name)},</p>
        ${raw.reminder
          ? `<p>Just a reminder: your remaining balance of <strong>£${esc(raw.amount)}</strong> is still to pay. Please pay it before your session begins.</p>`
          : `<p>Your remaining balance of <strong>£${esc(raw.amount)}</strong> is due before your session begins.</p>`}
        ${sessionLines(raw)}
        <p style="margin: 24px 0;">
          <a href="${esc(raw.payUrl)}" style="background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Pay £${esc(raw.amount)} now</a>
        </p>
        <p>If the button doesn't work, copy this link into your browser:<br>${esc(raw.payUrl)}</p>
        <p>If you have any questions, just reply to this email.</p>
        <p>Best regards,<br>RT Spaces Team</p>
      `,
    },
  ]);
}

/** Balance paid: tell the studio and send the customer a receipt. */
export async function sendBalancePaidNotification(raw: BalanceEmailData & { stripeUrl?: string }) {
  const m = mailer();
  if (!m) return;
  await sendAll(m, [
    {
      to: m.studioEmail,
      replyTo: raw.email || undefined,
      subject: `Balance Paid: £${esc(raw.amount)} from ${esc(raw.name)}`,
      html: `
        <h2>Balance paid in full</h2>
        <p><strong>Name:</strong> ${esc(raw.name)}</p>
        <p><strong>Email:</strong> ${esc(raw.email)}</p>
        <p><strong>Amount:</strong> £${esc(raw.amount)}</p>
        ${sessionLines(raw)}
        ${raw.stripeUrl ? `<p><a href="${esc(raw.stripeUrl)}">View the payment in Stripe</a></p>` : ''}
      `,
    },
    {
      to: raw.email,
      subject: 'Balance Paid - RT Spaces',
      html: `
        <h2>Thank you, you're all paid up</h2>
        <p>Hi ${esc(raw.name)},</p>
        <p>We've received your balance of <strong>£${esc(raw.amount)}</strong>. Your booking is now paid in full.</p>
        ${sessionLines(raw)}
        <p>See you soon!</p>
        <p>Best regards,<br>RT Spaces Team</p>
      `,
    },
  ]);
}

/** A plain heads-up to the studio (membership cancelled, renewal failed, ...). */
export async function sendStudioNotice(subject: string, lines: string[]) {
  const m = mailer();
  if (!m) return;
  await sendAll(m, [
    {
      to: m.studioEmail,
      subject,
      html: `<h2>${esc(subject)}</h2>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}`,
    },
  ]);
}

export async function subscribeToNewsletter(email: string) {
  const m = mailer();
  if (!m) return;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  // Add to the Resend audience when one is configured.
  if (audienceId) {
    try {
      await m.resend.contacts.create({ email, audienceId, unsubscribed: false });
    } catch (error) {
      console.error('Failed to add contact to Resend audience:', error);
    }
  }

  // Always notify the studio so a signup is never lost, even without an audience.
  await sendAll(m, [
    {
      to: m.studioEmail,
      subject: 'New Creator Circle signup',
      html: `<h2>New newsletter signup</h2><p><strong>Email:</strong> ${esc(email)}</p>`,
    },
  ]);
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.rtspaces.co.uk').replace(/\/$/, '');
}

/** A booking the studio added by hand: the customer's confirmation. */
export async function sendManualBookingConfirmation(
  raw: BalanceEmailData & { totalPrice: string; paidUpfront: string }
) {
  const m = mailer();
  if (!m) return;
  const owed = Number(raw.amount) > 0;
  await sendAll(m, [
    {
      to: raw.email,
      subject: 'Booking Confirmed - RT Spaces',
      html: `
        <h2>You're booked in</h2>
        <p>Hi ${esc(raw.name)},</p>
        <p>Your booking at RT Spaces is confirmed.</p>
        ${sessionLines(raw)}
        <p><strong>Total:</strong> £${esc(raw.totalPrice)}</p>
        ${Number(raw.paidUpfront) > 0 ? `<p><strong>Paid:</strong> £${esc(raw.paidUpfront)}</p>` : ''}
        ${owed
          ? `<p><strong>Balance:</strong> £${esc(raw.amount)}, due before your session begins. We'll email you a secure payment link 2 days before.</p>`
          : `<p>You're all paid up.</p>`}
        <p>If you have any questions, just reply to this email.</p>
        <p>See you soon!<br>RT Spaces Team</p>
      `,
    },
  ]);
}

/** Someone held a time but never paid, so the slot was released. */
export async function sendAbandonedBookingEmail(raw: {
  name: string;
  email: string;
  packageTitle?: string;
  bookingDate?: string;
}) {
  const m = mailer();
  if (!m) return;
  const what = raw.packageTitle ? esc(raw.packageTitle) : 'your session';
  const when = raw.bookingDate ? ` on ${esc(raw.bookingDate)}` : '';
  await sendAll(m, [
    {
      to: raw.email,
      subject: 'Still want to book RT Spaces?',
      html: `
        <h2>Your booking wasn't completed</h2>
        <p>Hi ${esc(raw.name)},</p>
        <p>You started booking ${what}${when}, but the deposit wasn't paid, so we couldn't hold that time for you.</p>
        <p>If you'd still like to come in, you can pick a time again here:</p>
        <p style="margin: 24px 0;">
          <a href="${siteUrl()}/book-online" style="background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Book your session</a>
        </p>
        <p>If something went wrong with the payment, or you have a question, just reply to this email and we'll help.</p>
        <p>Best regards,<br>RT Spaces Team</p>
      `,
    },
  ]);
}

/** The day after a session: ask for a Google review. */
export async function sendReviewRequestEmail(raw: { name: string; email: string; reviewUrl: string }) {
  const m = mailer();
  if (!m) return;
  await sendAll(m, [
    {
      to: raw.email,
      subject: 'How was your session at RT Spaces?',
      html: `
        <h2>Thanks for shooting with us</h2>
        <p>Hi ${esc(raw.name)},</p>
        <p>We hope your session went well. If you have a minute, a quick Google review helps other creatives find the studio, and it means a lot to us.</p>
        <p style="margin: 24px 0;">
          <a href="${esc(raw.reviewUrl)}" style="background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Leave a review</a>
        </p>
        <p>Want to book again? <a href="${siteUrl()}/book-online">Pick your next session here</a>.</p>
        <p>Thank you!<br>RT Spaces Team</p>
      `,
    },
  ]);
}
