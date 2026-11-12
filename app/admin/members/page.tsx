export const dynamic = "force-dynamic";

import { listMembers, MINIMUM_MONTHS, type Member } from "@/lib/admin/members";
import { CancelMemberButton } from "./CancelMemberButton";

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

function Status({ m }: { m: Member }) {
  const [label, cls] =
    m.status === "canceled"
      ? ["Ended", "bg-gray-50 text-gray-500 border-gray-200"]
      : m.paymentFailing
        ? ["Payment failing", "bg-rose-50 text-rose-700 border-rose-200"]
        : m.endsAt
          ? [`Ends ${date(m.endsAt)}`, "bg-amber-50 text-amber-700 border-amber-200"]
          : ["Active", "bg-emerald-50 text-emerald-700 border-emerald-200"];
  return <span className={`inline-flex px-1.5 py-0.5 rounded text-xs border whitespace-nowrap ${cls}`}>{label}</span>;
}

export default async function MembersPage() {
  let members: Member[] = [];
  let error = "";
  try {
    members = await listMembers();
  } catch (e) {
    console.error("[ADMIN] members: Stripe list failed", e);
    error = "Couldn't load memberships from Stripe. Refresh to try again.";
  }
  const active = members.filter((m) => m.status !== "canceled");
  const monthly = active.filter((m) => !m.endsAt).reduce((s, m) => s + m.monthly, 0);

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Members</h1>
        <p className="text-sm text-gray-500 mt-1">
          {active.length} active membership{active.length === 1 ? "" : "s"}, £{monthly.toFixed(2)} a month ongoing. Cancelling
          stops a membership at the end of what they&apos;ve paid for, or when the {MINIMUM_MONTHS}-month minimum is up if
          that&apos;s later. Nothing is refunded.
        </p>
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {members.length === 0 && !error ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-400">No memberships yet.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Member", "Plan", "Started", "Next payment", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.id} className={m.status === "canceled" ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{m.name || "—"}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {m.tier} <span className="text-gray-400">· £{m.monthly}/mo</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date(m.startedAt)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date(m.nextPaymentAt)}</td>
                  <td className="px-4 py-3"><Status m={m} /></td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {m.status !== "canceled" && !m.endsAt && <CancelMemberButton id={m.id} />}
                    <a href={m.stripeUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-gray-400 underline hover:text-gray-900">
                      Stripe ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
