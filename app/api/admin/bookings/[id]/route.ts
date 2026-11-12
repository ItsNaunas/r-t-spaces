import {
  ActionError,
  cancelBooking,
  chargeExtraOnBooking,
  markExtraPaid,
  markPaid,
  moveBooking,
  refundBooking,
  sendLinkNow,
  setNoShow,
  type RefundScope,
} from "@/lib/admin/bookingActions";
import { respond } from "../../_respond";

const SCOPES: RefundScope[] = ["balance", "deposit", "all"];

/**
 * The buttons on a booking row:
 * POST { action: "send_link", email? } | { action: "mark_paid" } |
 *      { action: "cancel" } | { action: "refund", scope: "balance" | "deposit" | "all" } |
 *      { action: "charge_extra", amount, reason, paidInPerson?, email? } |
 *      { action: "extra_paid", extraId } | { action: "move", start } | { action: "no_show", value }
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return respond(async () => {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    switch (body.action) {
      case "send_link":
        return sendLinkNow(id, typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : undefined);
      case "mark_paid":
        return markPaid(id);
      case "cancel":
        return cancelBooking(id);
      case "refund": {
        const scope = body.scope as RefundScope;
        if (!SCOPES.includes(scope)) throw new ActionError("Choose what to refund");
        return refundBooking(id, scope);
      }
      case "charge_extra":
        return chargeExtraOnBooking(id, body);
      case "extra_paid":
        if (typeof body.extraId !== "string") throw new ActionError("Missing charge");
        return markExtraPaid(body.extraId);
      case "move":
        if (typeof body.start !== "string") throw new ActionError("Choose a new time");
        return moveBooking(id, body.start);
      case "no_show":
        return setNoShow(id, body.value !== false);
      default:
        throw new ActionError("Unknown action");
    }
  });
}
