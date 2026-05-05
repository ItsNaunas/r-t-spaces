"use client";

import { useState } from "react";

type Booking = {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  bookingHours: string;
  packageTitle: string;
  totalPrice: string;
  depositPaid: string;
  balanceDue: string;
  addonsSummary: string;
  discountCode: string;
  discountAmount: string;
  paidAt: number;
  stripeUrl: string;
};

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerEmail.toLowerCase().includes(q) ||
      b.bookingDate.toLowerCase().includes(q) ||
      b.packageTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, date, or package…"
          className="border border-gray-200 rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:border-gray-900"
        />
        <span className="text-sm text-gray-400">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-400">
          {bookings.length === 0 ? "No paid bookings found." : "No results for that search."}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Customer", "Date & Time", "Package", "Total", "Deposit Paid", "Balance Due", "Discount", "Paid At", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => (
                <tr key={b.sessionId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{b.customerName}</p>
                    <p className="text-xs text-gray-400">{b.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{b.bookingDate}</p>
                    <p className="text-xs text-gray-400">{b.bookingHours}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{b.packageTitle}</p>
                    {b.addonsSummary && (
                      <p className="text-xs text-gray-400 mt-0.5">{b.addonsSummary}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{b.totalPrice}</td>
                  <td className="px-4 py-3 text-gray-700">{b.depositPaid}</td>
                  <td className="px-4 py-3 text-gray-500">{b.balanceDue}</td>
                  <td className="px-4 py-3">
                    {b.discountCode ? (
                      <div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {b.discountCode}
                        </span>
                        {b.discountAmount && (
                          <p className="text-xs text-gray-400 mt-0.5">-{b.discountAmount}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(b.paidAt * 1000).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={b.stripeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 underline hover:text-gray-900"
                    >
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
