"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@/lib/admin/customers";

type SortKey = "lastAt" | "bookings" | "totalPaid";

const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/** Private notes on a customer, edited in place. */
function NotesCell({ email, initial }: { email: string; initial: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/customers/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, notes: text }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    } else setError("Couldn't save");
  }

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className="text-left text-xs text-gray-500 hover:text-gray-900 max-w-64">
        {initial ? <span className="whitespace-pre-wrap">{initial}</span> : <span className="text-gray-300">+ Add note</span>}
      </button>
    );
  }
  return (
    <div className="space-y-1 min-w-56">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} className="w-full border border-gray-200 rounded px-2 py-1 text-xs" autoFocus />
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={saving} className="bg-gray-900 text-white text-xs px-2 py-1 rounded disabled:opacity-40">
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => { setEditing(false); setText(initial); }} className="text-xs text-gray-500">Cancel</button>
      </div>
      {error && <p className="text-xs text-rose-700">{error}</p>}
    </div>
  );
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("lastAt");

  const q = search.toLowerCase();
  const shown = customers
    .filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.sources.some((s) => s.includes(q))
    )
    .sort((a, b) => (sort === "lastAt" ? b.lastAt.localeCompare(a.lastAt) : b[sort] - a[sort]));

  const sortButton = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => setSort(key)}
      className={`px-2.5 py-1 rounded text-xs border ${sort === key ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:border-gray-900"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or source…"
          className="border border-gray-200 rounded-md px-3 py-2 text-sm w-72 max-w-full focus:outline-none focus:border-gray-900"
        />
        <span className="text-xs text-gray-500">Sort:</span>
        {sortButton("lastAt", "Most recent")}
        {sortButton("bookings", "Most bookings")}
        {sortButton("totalPaid", "Most spent")}
      </div>

      {shown.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-400">
          {customers.length === 0 ? "No customers yet." : "No results for that search."}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Customer", "Bookings", "Total paid", "First booked", "Last booked", "Source", "Notes"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shown.map((c) => (
                <tr key={c.email} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {c.name || "—"}
                      {c.member && (
                        <span className="ml-1.5 align-middle inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Member
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                    {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                    {c.noShows > 0 && (
                      <p className="text-xs text-rose-700 mt-0.5">⚠ {c.noShows} no-show{c.noShows > 1 ? "s" : ""}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.bookings}
                    {c.bookings > 1 && <span className="ml-1.5 text-xs text-emerald-700">repeat</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">£{c.totalPaid.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date(c.firstAt)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date(c.lastAt)}</td>
                  <td className="px-4 py-3 text-gray-500">{c.sources.join(", ") || "—"}</td>
                  <td className="px-4 py-3 align-top">
                    <NotesCell email={c.email} initial={c.notes} />
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
