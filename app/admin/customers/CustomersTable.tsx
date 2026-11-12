"use client";

import { useState } from "react";
import type { Customer } from "@/lib/admin/customers";

type SortKey = "lastAt" | "bookings" | "totalPaid";

const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

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
                {["Customer", "Bookings", "Total paid", "First booked", "Last booked", "Source"].map((h) => (
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
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.bookings}
                    {c.bookings > 1 && <span className="ml-1.5 text-xs text-emerald-700">repeat</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">£{c.totalPaid.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date(c.firstAt)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date(c.lastAt)}</td>
                  <td className="px-4 py-3 text-gray-500">{c.sources.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
