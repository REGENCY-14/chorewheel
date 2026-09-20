"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkDoneButton({ completionId }: { completionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markDone() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/completions/${completionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to mark done");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark done");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={markDone}
        disabled={pending}
        className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Marking…" : "Mark done"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
