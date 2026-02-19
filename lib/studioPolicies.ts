export const STUDIO_POLICIES_INTRO =
  "Welcome to rtspaces. By booking or entering our studio, you agree to the following terms and policies.";

export type PolicySection = {
  title: string;
  body?: string;
  items?: string[];
};

export const STUDIO_POLICIES_SECTIONS: PolicySection[] = [
  {
    title: "Bookings & payments",
    items: [
      "A non-refundable deposit is required to secure all bookings.",
      "The remaining balance must be paid before or on the day of the session.",
      "Sessions begin and end at the scheduled booking time.",
      "Late arrivals will reduce session time.",
    ],
  },
  {
    title: "Late fees & overtime",
    body: "If the studio is used beyond the booked time, overtime will be charged:",
    items: [
      "£15 per 15 minutes",
      "Rounded up to the nearest 15 minutes",
      "Charged automatically to the card on file",
    ],
  },
  {
    title: "Studio use & conduct",
    body: "To keep our space safe and professional:",
    items: [
      "Follow all photographer and staff instructions",
      "Children must be supervised at all times",
      "Studio equipment must not be touched unless instructed",
      "No food or drinks near equipment",
    ],
  },
  {
    title: "Damage, loss & theft",
    body: "Clients are fully responsible for any damage, loss, or theft caused by themselves or their guests.\n\nExample replacement costs (not limited to):",
    items: [
      "Light stands – from £80",
      "Studio lights – £250–£600",
      "Backdrops – from £60",
      "Cameras, laptops, monitors – full replacement cost",
    ],
  },
  {
    title: "If equipment is damaged, missing, or stolen",
    items: [
      "Repair or replacement costs will be charged",
      "A police report may be filed if required",
    ],
  },
  {
    title: "Card authorisation",
    body: "By booking with us, you authorise rtspaces to charge the card used for booking for:",
    items: ["Late fees", "Overtime", "Damage or missing equipment"],
  },
  {
    title: "Charges",
    body: "Charges will be supported with evidence and invoices where applicable.",
  },
  {
    title: "Liability disclaimer",
    body: "Clients enter the studio at their own risk.\n\nRtspaces is not liable for:",
    items: [
      "Personal injury",
      "Loss or damage to personal belongings",
      "Accidents caused by failure to follow studio rules",
    ],
  },
  {
    title: "Copyright & image use",
    items: [
      "All images remain the copyright of rtspaces",
      "Usage rights are granted as outlined in your booking agreement",
      "Commercial use requires written permission",
    ],
  },
  {
    title: "Data protection (GDPR)",
    items: [
      "Client data is stored securely",
      "Information is used only for booking and communication",
      "Data is never sold or shared",
      "Clients may request access or deletion of their data",
    ],
  },
  {
    title: "Final note",
    body: "Our goal is to provide a safe, professional, and creative environment for every client. Thank you for respecting our space and policies.",
  },
];
