"use client";

import { useState } from "react";
import type { MergedPackage } from "@/lib/admin/pricing-merged";

export function PackagesClient({ initialPackages }: { initialPackages: MergedPackage[] }) {
  const [packages, setPackages] = useState<MergedPackage[]>(initialPackages);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const updatePackage = async (packageId: string, payload: object) => {
    setSaving(packageId);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await fetch("/api/admin/packages").then((r) => r.json());
      setPackages(updated);
    } catch {
      alert("Failed to update. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const toggleEnabled = (pkg: MergedPackage) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, enabled: !p.enabled } : p))
    );
    updatePackage(pkg.id, {
      enabled: !pkg.enabled,
      priceOverride: pkg.priceOverrideActive ? pkg.price : null,
    });
  };

  const savePrice = (pkg: MergedPackage) => {
    const val = parseFloat(priceInput);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid price.");
      return;
    }
    setEditingPrice(null);
    setPackages((prev) =>
      prev.map((p) =>
        p.id === pkg.id ? { ...p, price: val, priceOverrideActive: true } : p
      )
    );
    updatePackage(pkg.id, { enabled: pkg.enabled, priceOverride: val });
  };

  const clearPrice = (pkg: MergedPackage) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === pkg.id
          ? { ...p, price: initialPackages.find((ip) => ip.id === p.id)!.price, priceOverrideActive: false }
          : p
      )
    );
    updatePackage(pkg.id, { enabled: pkg.enabled, priceOverride: null });
  };

  const PriceCell = ({ pkg }: { pkg: MergedPackage }) => {
    const original = initialPackages.find((p) => p.id === pkg.id)!;
    const isEditingThis = editingPrice === pkg.id;

    if (pkg.priceFromTime) {
      return <span className="text-xs text-gray-400">Hourly — not overridable</span>;
    }
    if (isEditingThis) {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-500">£</span>
          <input
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") savePrice(pkg);
              if (e.key === "Escape") setEditingPrice(null);
            }}
            autoFocus
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-gray-900"
          />
          <button
            onClick={() => savePrice(pkg)}
            disabled={saving === pkg.id}
            className="text-xs bg-gray-900 text-white px-2 py-1 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditingPrice(null)}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      );
    }
    if (pkg.priceOverrideActive) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">£{pkg.price}</span>
          <button
            onClick={() => { setPriceInput(String(pkg.price)); setEditingPrice(pkg.id); }}
            className="text-xs text-gray-500 underline hover:text-gray-900"
          >
            Edit
          </button>
          <button
            onClick={() => clearPrice(pkg)}
            className="text-xs text-gray-400 underline hover:text-red-600"
          >
            Clear
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => { setPriceInput(""); setEditingPrice(pkg.id); }}
        className="text-xs text-gray-400 underline hover:text-gray-900"
      >
        Override
      </button>
    );
  };

  return (
    <>
      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {packages.map((pkg) => {
          const original = initialPackages.find((p) => p.id === pkg.id)!;
          return (
            <div
              key={pkg.id}
              className={`bg-white border border-gray-200 rounded-lg p-4 space-y-3 ${
                !pkg.enabled ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{pkg.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{pkg.duration}</p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    pkg.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {pkg.enabled ? "Visible" : "Hidden"}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xs text-gray-400 w-16 shrink-0">Price</span>
                  <span className="text-gray-500">
                    £{pkg.priceFromTime ? `${pkg.hourlyRate ?? 55}/hr` : original.price}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">Override</span>
                  <PriceCell pkg={pkg} />
                </div>
              </div>

              <div className="pt-1 border-t border-gray-100">
                <button
                  onClick={() => toggleEnabled(pkg)}
                  disabled={saving === pkg.id}
                  className="text-xs text-gray-500 underline hover:text-gray-900 disabled:opacity-50"
                >
                  {saving === pkg.id ? "Saving…" : pkg.enabled ? "Hide from booking form" : "Show in booking form"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Package", "Original Price", "Override Price", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {packages.map((pkg) => {
              const original = initialPackages.find((p) => p.id === pkg.id)!;
              return (
                <tr key={pkg.id} className={`hover:bg-gray-50 ${!pkg.enabled ? "opacity-50" : ""}`}>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{pkg.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{pkg.duration}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    £{pkg.priceFromTime ? `${pkg.hourlyRate ?? 55}/hr` : original.price}
                  </td>
                  <td className="px-4 py-4">
                    <PriceCell pkg={pkg} />
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        pkg.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {pkg.enabled ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => toggleEnabled(pkg)}
                      disabled={saving === pkg.id}
                      className="text-xs text-gray-500 underline hover:text-gray-900 disabled:opacity-50"
                    >
                      {saving === pkg.id ? "Saving…" : pkg.enabled ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
