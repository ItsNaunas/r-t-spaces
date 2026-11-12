import {
  ActionError,
  cancelBooking,
  markPaid,
  refundBooking,
  sendLinkNow,
  type RefundScope,
} from "@/lib/admin/bookingActions";
import { respond } from "../../_respond";

const SCOPES: RefundScope[] = ["balance", "deposit", "all"];

/**
 * The buttons on a booking row:
 * POST { action: "send_link", email? } | { action: "mark_paid" } |
 *      { action: "cancel" } | { action: "refund", scope: "balance" | "deposit" | "all" }
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
      default:
        throw new ActionError("Unknown action");
    }
  });
}
