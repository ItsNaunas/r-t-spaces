"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelMemberButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function cancel() {
    if (!confirming) return setConfirming(true);
    setBusy(true);
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    setConfirming(false);
    setNote(res.ok ? { ok: true, text: json.message } : { ok: false, text: json.error ?? "Couldn't cancel" });
    if (res.ok) router.refresh();
  }

  return (
    <span className="inline-block align-middle">
      <button
        type="button"
        onClick={cancel}
        disabled={busy}
        className={`text-xs border rounded px-2 py-1 ${confirming ? "border-rose-300 text-rose-700 bg-rose-50" : "border-gray-200 text-gray-500 hover:text-gray-900"}`}
      >
        {confirming ? "Click again to cancel" : "Cancel membership"}
      </button>
      {note && <span className={`block text-xs mt-1 max-w-64 whitespace-normal ${note.ok ? "text-emerald-700" : "text-rose-700"}`}>{note.text}</span>}
    </span>
  );
}
