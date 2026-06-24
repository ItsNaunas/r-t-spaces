export type PolicySection = {
  title: string;
  body?: string;
  items?: string[];
};

export const STUDIO_TERMS_EFFECTIVE = "24 June 2026";

export const STUDIO_TERMS_INTRO =
  "These Terms & Conditions apply to all studio hire bookings made with RTspaces. By paying a deposit, making payment, entering the studio or signing the client agreement, the Client confirms acceptance of these Terms.";

export const STUDIO_TERMS_SECTIONS: PolicySection[] = [
  {
    title: "1. Booking confirmation & deposit",
    items: [
      "All bookings are subject to availability and confirmation by RTspaces.",
      "A non-refundable booking deposit of 50% of the total hire fee is required to secure the booking date and time.",
      "A booking is not confirmed until the deposit has been received.",
      "The remaining balance must be paid in full before the session begins. Access to the studio will not be granted until full payment has cleared.",
    ],
  },
  {
    title: "2. Studio hire fees",
    items: [
      "Studio hire is charged at £55 per hour.",
      "Booking time includes setup, shooting, changing, packing away and leaving the premises.",
      "Additional services or requests may incur extra charges.",
    ],
  },
  {
    title: "3. Payments",
    items: [
      "Full payment must be received before studio access is provided.",
      "Any additional charges incurred during the booking must be settled before departure unless otherwise agreed in writing.",
      "RTspaces reserves the right to refuse access where payment remains outstanding.",
    ],
  },
  {
    title: "4. Late arrival, overtime & late fees",
    items: [
      "Clients are expected to arrive at the agreed booking time.",
      "Late arrival does not extend the booking end time.",
      "RTspaces may allow a 5 minute grace period at its discretion only.",
      "If the Client exceeds the booked session time, a £15 late fee will apply for the first 15 minutes beyond the agreed end time, and continued use of the studio will be charged proportionally based on the standard rate of £55 per hour.",
      "Sessions must end at the agreed time where another booking follows.",
    ],
  },
  {
    title: "5. Card authorisation",
    body: "By booking with RTspaces, you authorise us to charge the card used for the booking for any of the following where they apply:",
    items: [
      "Late fees",
      "Overtime",
      "Damage, loss, or missing equipment",
      "Cleaning charges",
    ],
  },
  {
    title: "6. Cancellation, rescheduling & no shows",
    items: [
      "Booking deposits are non-refundable.",
      "One reschedule may be permitted where notice is given at least 72 hours before the booking, subject to availability.",
      "Requests made with less than 72 hours' notice may result in loss of deposit.",
      "Failure to attend the booking (“No Show”) will result in loss of all amounts paid.",
    ],
  },
  {
    title: "7. Studio use rules",
    items: [
      "Clients must leave the studio in substantially the same condition as it was provided.",
      "No smoking, illegal substances, open flames, hazardous materials or activities likely to damage the space are permitted.",
      "Food and drink are only permitted where approved.",
      "Children must remain supervised at all times.",
      "Clients are responsible for the behaviour of all guests, models, assistants, suppliers, and visitors attending their booking.",
      "RTspaces reserves the right to end a booking immediately without refund where conduct is unsafe, abusive, unlawful, or damaging.",
    ],
  },
  {
    title: "8. Damage, equipment liability & cleaning charges",
    body: "Clients accept full responsibility for all studio areas, furniture, fixtures, props, and equipment used during their booking. Any damaged, lost, broken, stolen, misused or excessively worn equipment or studio property will be repaired or replaced at the Client's expense and charged directly to the Client.\n\nRTspaces reserves the right to invoice the Client for repair costs, replacement costs, labour costs, professional cleaning costs, and loss of business caused by damage where legally recoverable.\n\nExample replacement costs (not limited to):",
    items: [
      "Light stands – from £80",
      "Studio lights – £250–£600",
      "Backdrops – from £60",
      "Cameras, laptops, monitors – full replacement cost",
      "Where equipment is stolen or goes missing, a police report may be filed.",
      "Excessive cleaning resulting from the booking may incur a minimum cleaning fee of £50.",
      "Payment of damage related invoices must be made within 7 calendar days of invoice issue, supported with evidence and invoices where applicable.",
    ],
  },
  {
    title: "9. Personal property",
    items: [
      "RTspaces accepts no responsibility for loss, theft, or damage to personal belongings brought into the studio.",
      "Any items left behind may be disposed of after 30 days if unclaimed.",
    ],
  },
  {
    title: "10. Liability",
    body: "Clients enter and use the studio at their own risk. RTspaces is not liable for:",
    items: [
      "Personal injury",
      "Accidents caused by failure to follow studio rules or staff instructions",
      "Loss or damage to personal belongings brought into the studio",
    ],
  },
  {
    title: "11. Health & safety",
    items: [
      "Clients must use the studio and equipment safely and follow all instructions given by RTspaces staff.",
      "Equipment must only be operated by competent persons.",
      "Clients must immediately report accidents, faults, or damage.",
    ],
  },
  {
    title: "12. Photography, recording & content",
    items: [
      "Clients remain responsible for obtaining any permissions, licences, releases, or consents required for their shoot.",
      "RTspaces may request permission before using any behind-the-scenes content for promotional purposes.",
    ],
  },
  {
    title: "13. Data protection (GDPR)",
    items: [
      "Client data is stored securely.",
      "Information is used only for booking and communication.",
      "Data is never sold or shared.",
      "Clients may request access to, or deletion of, their data at any time.",
    ],
  },
  {
    title: "14. Force majeure",
    body: "RTspaces shall not be liable for cancellations, interruptions, delays or inability to perform services caused by events beyond reasonable control including weather, utility failures, emergencies or other unforeseen circumstances.",
  },
  {
    title: "15. Governing law",
    body: "These Terms & Conditions shall be governed by and interpreted in accordance with the laws of England and Wales.",
  },
  {
    title: "Client agreement",
    body: "By completing a booking with RTspaces, you confirm that:",
    items: [
      "You have read and agree to the RTspaces Terms & Conditions.",
      "You accept responsibility for all persons attending under your booking.",
      "You understand that damaged, lost, or broken equipment and studio property will be charged to you.",
      "You agree to pay any overtime, late fees, cleaning, repair, replacement, or additional charges where applicable.",
      "You understand that full payment must be made before the session begins.",
    ],
  },
];
