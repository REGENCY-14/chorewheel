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
    <div className="flex w-full flex-col items-stretch gap-1 sm:w-auto sm:items-end">
      <button
        onClick={markDone}
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Marking…" : "Mark done"}
      </button>
      {error && <p className="text-xs text-rejected">{error}</p>}
    </div>
  );
}
