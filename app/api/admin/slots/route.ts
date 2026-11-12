import { getAvailableSlots, getEventTypeId } from "@/lib/calcom";
import { ActionError, quotePrice } from "@/lib/admin/bookingActions";
import { getMergedPackages } from "@/lib/admin/pricing-merged";
import { respond } from "../_respond";

export const dynamic = "force-dynamic";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Free start times for one package on one day, each with the package's
 * normal price at that time: GET /api/admin/slots?packageId=x&date=2026-11-20&hours=3
 */
export async function GET(request: Request) {
  return respond(async () => {
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get("packageId") ?? "";
    const date = searchParams.get("date") ?? "";
    const hoursParam = searchParams.get("hours");
    if (!DATE.test(date)) throw new ActionError("Choose a date");

    const pkg = (await getMergedPackages()).find((p) => p.id === packageId);
    if (!pkg) throw new ActionError("Unknown package");
    const hours = pkg.priceFromTime ? Math.max(1, Math.min(12, Number(hoursParam) || pkg.minimumHours || 2)) : pkg.hours;

    const eventTypeId = await getEventTypeId(pkg.id);
    if (!eventTypeId) throw new ActionError("That package has no Cal.com event type", 500);

    const next = new Date(`${date}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    const byDate = await getAvailableSlots(
      eventTypeId,
      date,
      next.toISOString().slice(0, 10),
      pkg.priceFromTime ? hours * 60 : undefined
    );
    const starts = byDate[date] ?? [];
    const slots = await Promise.all(
      starts.map(async (start) => ({ start, price: (await quotePrice(pkg.id, start, hours)).price }))
    );
    return { slots, hours, hourly: Boolean(pkg.priceFromTime) };
  });
}
