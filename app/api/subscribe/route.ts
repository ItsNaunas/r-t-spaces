import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    await subscribeToNewsletter(email.trim().toLowerCase());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscription failed:", error);
    return NextResponse.json({ error: "Subscription failed." }, { status: 500 });
  }
}
