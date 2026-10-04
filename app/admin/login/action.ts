"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, COOKIE_NAME } from "@/lib/admin/auth";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/** Timing-safe string comparison, so a wrong password leaks nothing by duration. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const password = formData.get("password") as string;
  const from = (formData.get("from") as string) || "/admin/bookings";
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return { error: "Admin access is not configured." };
  }

  // The admin can change live prices and mint 100% discount codes, so a single
  // shared password needs a brute-force ceiling: 5 attempts per 15 minutes.
  const headersList = await headers();
  const { allowed } = await rateLimit("admin-login", clientIp(headersList), 5, 15 * 60);
  if (!allowed) {
    return { error: "Too many attempts. Please wait 15 minutes and try again." };
  }

  if (!password || !safeEqual(password, expectedPassword)) {
    return { error: "Invalid password." };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  redirect(from);
}
