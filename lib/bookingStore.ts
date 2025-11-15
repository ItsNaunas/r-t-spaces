import { promises as fs } from "fs";
import path from "path";

export type BookingEntry = {
  name: string;
  email: string;
  date?: string;
  hours?: string;
  notes?: string;
  createdAt: string;
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

export async function saveBooking(entry: Omit<BookingEntry, "createdAt">) {
  await ensureFile();
  const raw = await fs.readFile(bookingsFile, "utf-8");
  const bookings: BookingEntry[] = JSON.parse(raw);
  bookings.push({ ...entry, createdAt: new Date().toISOString() });
  await fs.writeFile(bookingsFile, JSON.stringify(bookings, null, 2), "utf-8");
}

