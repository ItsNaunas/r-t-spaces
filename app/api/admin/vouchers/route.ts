import { NextResponse } from "next/server";
import { getVoucher, issueVoucher, VOUCHER_MAX, voidVoucher } from "@/lib/vouchers";
import { sendComplimentaryVoucherEmail } from "@/lib/email";
import { logActivity } from "@/lib/activity";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Issue a complimentary voucher: POST { amount, recipientName?, recipientEmail?, note? } */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const amount = Math.round(Number(body.amount) * 100) / 100;
    const recipientName = str(body.recipientName, 100);
    const recipientEmail = str(body.recipientEmail, 200).toLowerCase();
    const note = str(body.note, 200);
    if (!Number.isFinite(amount) || amount < 1 || amount > VOUCHER_MAX) {
      return NextResponse.json({ error: `Amount must be £1 to £${VOUCHER_MAX}` }, { status: 400 });
    }
    if (recipientEmail && !EMAIL.test(recipientEmail)) {
      return NextResponse.json({ error: "That email address doesn't look right" }, { status: 400 });
    }

    const voucher = await issueVoucher({
      amountPence: Math.round(amount * 100),
      source: "manual",
      buyerName: "RT Spaces (complimentary)",
      buyerEmail: "",
      recipientName: recipientName || undefined,
      recipientEmail: recipientEmail || undefined,
      message: note || undefined,
    });
    await logActivity({
      action: "voucher.issue",
      summary: `Issued a complimentary £${amount.toFixed(2)} voucher ${voucher.code}${recipientName ? ` for ${recipientName}` : ""}`,
      ref: voucher.code,
      amount,
    });

    let emailed = false;
    if (recipientEmail) {
      try {
        await sendComplimentaryVoucherEmail({
          code: voucher.code,
          amount: amount.toFixed(2),
          expires: new Date(voucher.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
          buyerName: "RT Spaces",
          buyerEmail: "",
          recipientName,
          recipientEmail,
        });
        emailed = true;
      } catch (error) {
        console.error("[ADMIN] complimentary voucher email failed:", error);
      }
    }
    return NextResponse.json({
      message: `Voucher ${voucher.code} created${emailed ? ` and emailed to ${recipientEmail}` : recipientEmail ? ", but the email didn't send: give them the code" : ""}.`,
      code: voucher.code,
    });
  } catch (error) {
    console.error("[ADMIN] voucher issue failed:", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

/** Switch a voucher off: DELETE ?code=RT-XXXX-XXXX */
export async function DELETE(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const voucher = await getVoucher(code);
  if (!voucher || !(await voidVoucher(code))) return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
  await logActivity({
    action: "voucher.void",
    summary: `Switched off voucher ${voucher.code} (£${(voucher.balancePence / 100).toFixed(2)} was left on it)`,
    ref: voucher.code,
  });
  return NextResponse.json({ message: `${voucher.code} switched off.` });
}
