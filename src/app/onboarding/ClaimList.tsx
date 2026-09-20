"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClaimList({ members }: { members: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function claim(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/members/${id}/claim`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to claim");
      }
      router.push("/board");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim");
      setPendingId(null);
    }
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        No unclaimed names yet — ask an admin to add you in <code>/admin</code>.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {members.map((m) => (
        <button
          key={m.id}
          onClick={() => claim(m.id)}
          disabled={pendingId !== null}
          className="rounded-md border border-black/20 px-4 py-2 text-left text-sm disabled:opacity-50 dark:border-white/20"
        >
          {pendingId === m.id ? "Claiming…" : m.name}
        </button>
      ))}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
