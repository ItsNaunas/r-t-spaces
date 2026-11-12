import { buildReport, reportCsv } from "@/lib/admin/report";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Download one month's payments: GET /api/admin/reports/export?month=2026-11 */
export async function GET(request: Request) {
  const month = new URL(request.url).searchParams.get("month") ?? "";
  try {
    const report = await buildReport(month);
    return new Response(`﻿${reportCsv(report)}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rt-spaces-payments-${month}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[ADMIN] report export failed:", error);
    return new Response("Couldn't build that report.", { status: 400 });
  }
}
