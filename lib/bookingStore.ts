import { promises as fs } from "fs";
import path from "path";

export type BookingEntry = {
  name: string;
  email: string;
  date?: string;
  hours?: string;
  notes?: string;
  createdAt: string;
  status?: "pending" | "confirmed" | "cancelled";
  paymentIntentId?: string;
  paidAt?: string;
  calendarEventId?: string;
};

const bookingsFile = path.join(process.cwd(), "data", "bookings.json");

async function ensureFile() {
  await fs.mkdir(path.dirname(bookingsFile), { recursive: true });
  try {
    await fs.access(bookingsFile);
  } catch {
    await fs.writeFile(bookingsFile, "[]", "utf-8");
  }
}

export async function saveBooking(entry: Omit<BookingEntry, "createdAt">): Promise<BookingEntry> {
  await ensureFile();
  const raw = await fs.readFile(bookingsFile, "utf-8");
  let bookings: BookingEntry[];
  try {
    const parsed = JSON.parse(raw);
    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      throw new Error("Bookings file does not contain an array");
    }
    bookings = parsed as BookingEntry[];
  } catch (error) {
    // If file is corrupted, start with empty array
    console.error("Error parsing bookings file, starting fresh:", error);
    bookings = [];
  }
  const newBooking: BookingEntry = { ...entry, createdAt: new Date().toISOString() };
  bookings.push(newBooking);
  await fs.writeFile(bookingsFile, JSON.stringify(bookings, null, 2), "utf-8");
  return newBooking;
}

