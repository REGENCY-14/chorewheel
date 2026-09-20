"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Approval = {
  completionId: string;
  choreName: string;
  memberName: string;
  cycleNumber: number;
};

export function ApprovalsQueue({ approvals }: { approvals: Approval[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(completionId: string, status: "approved" | "rejected") {
    setPendingId(completionId);
    setError(null);
    try {
      const res = await fetch(`/api/completions/${completionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update completion");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update completion");
    } finally {
      setPendingId(null);
    }
  }

  if (approvals.length === 0) {
    return <p className="text-sm text-black/60 dark:text-white/60">Nothing waiting on approval.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {approvals.map((a) => (
          <li
            key={a.completionId}
            className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-2 dark:border-white/10"
          >
            <div>
              <p className="font-medium">{a.choreName}</p>
              <p className="text-sm text-black/60 dark:text-white/60">
                {a.memberName} · cycle #{a.cycleNumber}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => decide(a.completionId, "approved")}
                disabled={pendingId === a.completionId}
                className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => decide(a.completionId, "rejected")}
                disabled={pendingId === a.completionId}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
