"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DiscountCode } from "@/lib/admin/types";

type PackageOption = { id: string; title: string };

const EMPTY_FORM = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  scope: "global",
  expiresAt: "",
  maxUses: "",
  active: true,
};

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
    setForm({
      code: code.code,
      type: code.type,
      value: String(code.value),
      scope: code.scope,
      expiresAt: code.expiresAt ? code.expiresAt.slice(0, 10) : "",
      maxUses: code.maxUses != null ? String(code.maxUses) : "",
      active: code.active,
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        scope: form.scope,
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
      setCodes((prev) => prev.map((c) => (c.code === code.code ? { ...c, active: !c.active } : c)));
    } catch {
      alert("Failed to update. Please try again.");
    }
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

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Code">
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                disabled={!!editingCode}
                placeholder="SUMMER20"
                className="admin-input disabled:bg-gray-50 disabled:text-gray-400"
              />
            </FormField>

            <FormField label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percentage" | "fixed" }))}
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

            <FormField label="Applies to">
              <select
                value={form.scope}
                onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
                className="admin-input"
              >
                <option value="global">All packages</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
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
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Code", "Type", "Scope", "Expires", "Uses", "Active", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
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
                  <td className="px-4 py-3 text-gray-500">
                    {code.scope === "global" ? "All packages" : packages.find((p) => p.id === code.scope)?.title ?? code.scope}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString("en-GB") : "Never"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {code.usedCount}{code.maxUses != null ? ` / ${code.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(code)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${code.active ? "bg-gray-900" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${code.active ? "translate-x-5" : "translate-x-1"}`} />
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
