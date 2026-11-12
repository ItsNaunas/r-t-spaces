import { createManualBooking, parseManualBookingInput } from "@/lib/admin/bookingActions";
import { respond } from "../_respond";

/** Add a booking by hand: confirmed in Cal.com at once, so the slot is taken. */
export async function POST(request: Request) {
  return respond(async () => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return createManualBooking(parseManualBookingInput(body));
  });
}
