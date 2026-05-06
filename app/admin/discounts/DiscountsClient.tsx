"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DiscountCode } from "@/lib/admin/types";

type PackageOption = {
  id: string;
  title: string;
  group: "Photo Sessions" | "Studio Hire";
};

const PACKAGE_GROUPS: Array<{ label: "Photo Sessions" | "Studio Hire" }> = [
  { label: "Photo Sessions" },
  { label: "Studio Hire" },
];

const EMPTY_FORM = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  scopeType: "global" as "global" | "specific",
  scopeIds: [] as string[],
  expiresAt: "",
  maxUses: "",
  active: true,
};

function normalizeScope(scope: DiscountCode["scope"]): string[] {
  if (scope === "global") return [];
  return Array.isArray(scope) ? scope : [scope as string];
}

function renderScope(scope: DiscountCode["scope"], packages: PackageOption[]): string {
  if (scope === "global") return "All packages";
  const ids = Array.isArray(scope) ? scope : [scope as string];
  if (ids.length === 0 || ids.length === packages.length) return "All packages";
  if (ids.length === 1) return packages.find((p) => p.id === ids[0])?.title ?? ids[0];
  if (ids.length === 2)
    return ids.map((id) => packages.find((p) => p.id === id)?.title?.split(" ")[0] ?? id).join(" & ");
  return `${ids.length} packages`;
}

export function DiscountsClient({
  initialCodes,
  packages,
}: {
  initialCodes: DiscountCode[];
  packages: PackageOption[];
}) {
  const router = useRouter();
  const [codes, setCodes] = useState<DiscountCode[]>(initialCodes);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditingCode(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (code: DiscountCode) => {
    setEditingCode(code.code);
    const scopeIds = normalizeScope(code.scope);
    setForm({
      code: code.code,
      type: code.type,
      value: String(code.value),
      scopeType: code.scope === "global" ? "global" : "specific",
      scopeIds,
      expiresAt: code.expiresAt ? code.expiresAt.slice(0, 10) : "",
      maxUses: code.maxUses != null ? String(code.maxUses) : "",
      active: code.active,
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (form.scopeType === "specific" && form.scopeIds.length === 0) {
      setError("Select at least one package, or choose All packages.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        scope: form.scopeType === "global" ? "global" : form.scopeIds,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        active: form.active,
      };

      let res: Response;
      if (editingCode) {
        res = await fetch(`/api/admin/discounts/${editingCode}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/discounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      setShowForm(false);
      router.refresh();
      const updated = await fetch("/api/admin/discounts").then((r) => r.json());
      setCodes(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete code "${code}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/discounts/${code}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setCodes((prev) => prev.filter((c) => c.code !== code));
    } catch {
      alert("Failed to delete code. Please try again.");
    }
  };

  const toggleActive = async (code: DiscountCode) => {
    try {
      await fetch(`/api/admin/discounts/${code.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !code.active }),
      });
      setCodes((prev) =>
        prev.map((c) => (c.code === code.code ? { ...c, active: !c.active } : c))
      );
    } catch {
      alert("Failed to update. Please try again.");
    }
  };

  const togglePackage = (id: string) => {
    setForm((f) => ({
      ...f,
      scopeIds: f.scopeIds.includes(id)
        ? f.scopeIds.filter((x) => x !== id)
        : [...f.scopeIds, id],
    }));
  };

  const toggleGroup = (groupLabel: "Photo Sessions" | "Studio Hire") => {
    const groupIds = packages.filter((p) => p.group === groupLabel).map((p) => p.id);
    const allSelected = groupIds.every((id) => form.scopeIds.includes(id));
    setForm((f) => ({
      ...f,
      scopeIds: allSelected
        ? f.scopeIds.filter((id) => !groupIds.includes(id))
        : [...new Set([...f.scopeIds, ...groupIds])],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="bg-gray-900 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
        >
          + New code
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {editingCode ? `Edit ${editingCode}` : "New discount code"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Code">
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                disabled={!!editingCode}
                placeholder="SUMMER20"
                className="admin-input disabled:bg-gray-50 disabled:text-gray-400"
              />
            </FormField>

            <FormField label="Type">
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as "percentage" | "fixed" }))
                }
                className="admin-input"
              >
                <option value="percentage">% off</option>
                <option value="fixed">£ off</option>
              </select>
            </FormField>

            <FormField label={form.type === "percentage" ? "Percentage (%)" : "Amount (£)"}>
              <input
                type="number"
                min="0"
                max={form.type === "percentage" ? "100" : undefined}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={form.type === "percentage" ? "20" : "15"}
                className="admin-input"
              />
            </FormField>

            <FormField label="Expires (optional)">
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="admin-input"
              />
            </FormField>

            <FormField label="Max uses (optional)">
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="Unlimited"
                className="admin-input"
              />
            </FormField>
          </div>

          {/* Applies to — full width */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Applies to</label>

            <div className="flex rounded-md border border-gray-200 overflow-hidden w-fit text-sm">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, scopeType: "global", scopeIds: [] }))}
                className={`px-4 py-1.5 transition-colors ${
                  form.scopeType === "global"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                All packages
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, scopeType: "specific" }))}
                className={`px-4 py-1.5 border-l border-gray-200 transition-colors ${
                  form.scopeType === "specific"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Specific packages
              </button>
            </div>

            {form.scopeType === "specific" && (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                {PACKAGE_GROUPS.map((group, gi) => {
                  const groupPkgs = packages.filter((p) => p.group === group.label);
                  const allSelected = groupPkgs.every((p) => form.scopeIds.includes(p.id));
                  return (
                    <div key={group.label} className={gi > 0 ? "border-t border-gray-200" : ""}>
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {group.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.label)}
                          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {allSelected ? "Deselect all" : "Select all"}
                        </button>
                      </div>
                      {groupPkgs.map((pkg) => {
                        const checked = form.scopeIds.includes(pkg.id);
                        return (
                          <label
                            key={pkg.id}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-gray-50 ${
                              checked ? "bg-gray-50/80" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePackage(pkg.id)}
                              className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-700">{pkg.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-900 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {codes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-400">
          No discount codes yet. Create one above.
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
            {codes.map((code) => (
              <div key={code.code} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-gray-900">{code.code}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {code.type === "percentage" ? `${code.value}%` : `£${code.value}`} off
                      {" · "}
                      {renderScope(code.scope, packages)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {code.expiresAt
                        ? `Expires ${new Date(code.expiresAt).toLocaleDateString("en-GB")}`
                        : "No expiry"}
                      {" · "}
                      {code.usedCount}
                      {code.maxUses != null ? ` / ${code.maxUses}` : ""} uses
                    </p>
                  </div>
                  <button
                    onClick={() => toggleActive(code)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      code.active ? "bg-gray-900" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        code.active ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => openEdit(code)}
                    className="text-xs text-gray-500 hover:text-gray-900 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(code.code)}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Code", "Discount", "Applies to", "Expires", "Uses", "Active", ""].map((h) => (
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
                {codes.map((code) => (
                  <tr key={code.code} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{code.code}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {code.type === "percentage" ? `${code.value}%` : `£${code.value}`} off
                    </td>
                    <td className="px-4 py-3 text-gray-500">{renderScope(code.scope, packages)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {code.expiresAt
                        ? new Date(code.expiresAt).toLocaleDateString("en-GB")
                        : "Never"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {code.usedCount}
                      {code.maxUses != null ? ` / ${code.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(code)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          code.active ? "bg-gray-900" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            code.active ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => openEdit(code)}
                          className="text-xs text-gray-500 hover:text-gray-900 underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(code.code)}
                          className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style jsx>{`
        .admin-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .admin-input:focus {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
        }
      `}</style>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}
