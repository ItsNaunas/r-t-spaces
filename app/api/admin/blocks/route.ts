import { NextResponse } from "next/server";
import { BlockError, createBlock, removeBlock } from "@/lib/admin/blocks";

const fail = (error: unknown) => {
  if (error instanceof BlockError) return NextResponse.json({ error: error.message }, { status: 400 });
  console.error("[ADMIN] block failed:", error);
  return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
};

/** Block out time: POST { start, hours, reason } */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const block = await createBlock({
      start: String(body.start ?? ""),
      hours: Number(body.hours),
      reason: typeof body.reason === "string" ? body.reason : "",
    });
    return NextResponse.json({ message: `Blocked ${block.bookingDate}, ${block.bookingHours}.`, block });
  } catch (error) {
    return fail(error);
  }
}

/** Reopen: DELETE ?id=block_... */
export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id") ?? "";
    if (!/^block_[A-Za-z0-9_-]+$/.test(id) || !(await removeBlock(id))) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Reopened. That time is bookable again." });
  } catch (error) {
    return fail(error);
  }
}
