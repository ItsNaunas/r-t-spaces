import { getRedis } from "./redis";

export type BookingEntry = {
  name: string;
  email: string;
  date?: string;
  hours?: string;
  notes?: string;
  createdAt: string;
};

const BOOKINGS_KEY = "bookings";

export async function saveBooking(entry: Omit<BookingEntry, "createdAt">): Promise<BookingEntry> {
  const redis = getRedis();
  const newBooking: BookingEntry = { ...entry, createdAt: new Date().toISOString() };
  await redis.rpush(BOOKINGS_KEY, JSON.stringify(newBooking));
  return newBooking;
}

export async function getAllBookings(): Promise<BookingEntry[]> {
  const redis = getRedis();
  const items = await redis.lrange<BookingEntry>(BOOKINGS_KEY, 0, -1);
  return items ?? [];
}
