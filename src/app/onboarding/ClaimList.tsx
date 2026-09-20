"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";

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
      <p className="text-sm text-fg/70">
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
          className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-2.5 text-left text-sm font-medium transition-colors hover:border-accent disabled:opacity-50"
        >
          <Avatar id={m.id} name={m.name} />
          {pendingId === m.id ? "Claiming…" : m.name}
        </button>
      ))}
      {error && <p className="text-sm text-rejected">{error}</p>}
    </div>
  );
}
