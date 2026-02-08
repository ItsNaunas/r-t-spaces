import { promises as fs } from "fs";
import path from "path";
import { cancelCalendlyEvent } from "./calendlyApi";

export type PendingBooking = {
  id: string;
  calendlyEventUri: string;
  calendlyInviteeUri?: string;
  customerName: string;
  customerEmail: string;
  startTime: string;
  endTime: string;
  stripeSessionId?: string;
  createdAt: string;
  expiresAt: string; // 15 minutes from creation
  status: "pending" | "confirmed" | "cancelled";
  bookingData?: {
    packageId?: string;
    packageTitle?: string;
    totalPrice?: number;
    depositAmount?: number;
    addonsTotal?: number;
    addonsSummary?: string;
  };
};

const pendingBookingsFile = path.join(process.cwd(), "data", "pending-bookings.json");

async function ensureFile() {
  await fs.mkdir(path.dirname(pendingBookingsFile), { recursive: true });
  try {
    await fs.access(pendingBookingsFile);
  } catch {
    await fs.writeFile(pendingBookingsFile, "[]", "utf-8");
  }
}

export async function savePendingBooking(
  booking: Omit<PendingBooking, "createdAt" | "expiresAt" | "status">
): Promise<PendingBooking> {
  await ensureFile();
  const raw = await fs.readFile(pendingBookingsFile, "utf-8");
  const bookings: PendingBooking[] = JSON.parse(raw);
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
  
  const newBooking: PendingBooking = {
    ...booking,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "pending",
  };
  
  bookings.push(newBooking);
  await fs.writeFile(pendingBookingsFile, JSON.stringify(bookings, null, 2), "utf-8");
  return newBooking;
}

export async function getPendingBooking(id: string): Promise<PendingBooking | null> {
  await ensureFile();
  const raw = await fs.readFile(pendingBookingsFile, "utf-8");
  const bookings: PendingBooking[] = JSON.parse(raw);
  return bookings.find((b) => b.id === id) || null;
}

export async function getPendingBookingByCalendlyEvent(
  calendlyEventUri: string
): Promise<PendingBooking | null> {
  await ensureFile();
  const raw = await fs.readFile(pendingBookingsFile, "utf-8");
  const bookings: PendingBooking[] = JSON.parse(raw);
  return bookings.find((b) => b.calendlyEventUri === calendlyEventUri && b.status === "pending") || null;
}

export async function getPendingBookingByStripeSession(
  stripeSessionId: string
): Promise<PendingBooking | null> {
  await ensureFile();
  const raw = await fs.readFile(pendingBookingsFile, "utf-8");
  const bookings: PendingBooking[] = JSON.parse(raw);
  return bookings.find((b) => b.stripeSessionId === stripeSessionId) || null;
}

export async function updatePendingBookingStripeSession(
  id: string,
  stripeSessionId: string
): Promise<boolean> {
  await ensureFile();
  const raw = await fs.readFile(pendingBookingsFile, "utf-8");
  const bookings: PendingBooking[] = JSON.parse(raw);
  
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return false;
  
  bookings[index].stripeSessionId = stripeSessionId;
  await fs.writeFile(pendingBookingsFile, JSON.stringify(bookings, null, 2), "utf-8");
  return true;
}

export async function confirmPendingBooking(id: string, stripeSessionId?: string): Promise<boolean> {
  await ensureFile();
  const raw = await fs.readFile(pendingBookingsFile, "utf-8");
  const bookings: PendingBooking[] = JSON.parse(raw);
  
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return false;
  
  bookings[index].status = "confirmed";
  if (stripeSessionId) {
    bookings[index].stripeSessionId = stripeSessionId;
  }
  await fs.writeFile(pendingBookingsFile, JSON.stringify(bookings, null, 2), "utf-8");
  return true;
}

export async function cancelPendingBooking(id: string, reason?: string): Promise<boolean> {
  await ensureFile();
  const raw = await fs.readFile(pendingBookingsFile, "utf-8");
  const bookings: PendingBooking[] = JSON.parse(raw);
  
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return false;
  
  const booking = bookings[index];
  
  // Cancel the Calendly event
  if (booking.status === "pending" && booking.calendlyEventUri) {
    await cancelCalendlyEvent(booking.calendlyEventUri, reason || "Payment not completed within 15 minutes");
  }
  
  bookings[index].status = "cancelled";
  await fs.writeFile(pendingBookingsFile, JSON.stringify(bookings, null, 2), "utf-8");
  return true;
}

export async function cancelExpiredPendingBookings(): Promise<number> {
  await ensureFile();
  const raw = await fs.readFile(pendingBookingsFile, "utf-8");
  const bookings: PendingBooking[] = JSON.parse(raw);
  
  const now = new Date();
  let cancelledCount = 0;
  
  for (const booking of bookings) {
    if (booking.status === "pending" && new Date(booking.expiresAt) < now) {
      // Cancel expired booking
      if (booking.calendlyEventUri) {
        await cancelCalendlyEvent(
          booking.calendlyEventUri,
          "Payment not completed within 15 minutes"
        );
      }
      booking.status = "cancelled";
      cancelledCount++;
    }
  }
  
  if (cancelledCount > 0) {
    await fs.writeFile(pendingBookingsFile, JSON.stringify(bookings, null, 2), "utf-8");
  }
  
  return cancelledCount;
}

export async function getAllPendingBookings(): Promise<PendingBooking[]> {
  await ensureFile();
  const raw = await fs.readFile(pendingBookingsFile, "utf-8");
  const bookings: PendingBooking[] = JSON.parse(raw);
  return bookings.filter((b) => b.status === "pending");
}

