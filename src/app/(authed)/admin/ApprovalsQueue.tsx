"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";

type Approval = {
  completionId: string;
  choreName: string;
  memberId: string;
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
    return <p className="text-sm text-fg/70">Nothing waiting on you right now.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-3">
        {approvals.map((a) => (
          <li
            key={a.completionId}
            className="flex flex-col gap-3 rounded-md border-l-4 border-l-review border-y border-r border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <Avatar id={a.memberId} name={a.memberName} />
              <div className="flex flex-col">
                <span className="text-base font-semibold leading-tight">{a.choreName}</span>
                <span className="text-sm text-fg/70">
                  {a.memberName} · cycle #{a.cycleNumber}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => decide(a.completionId, "approved")}
                disabled={pendingId === a.completionId}
                className="flex-1 rounded-md bg-approved px-4 py-2 text-sm font-semibold text-paper transition-colors hover:opacity-90 disabled:opacity-50 sm:flex-none"
              >
                Approve
              </button>
              <button
                onClick={() => decide(a.completionId, "rejected")}
                disabled={pendingId === a.completionId}
                className="flex-1 rounded-md bg-rejected px-4 py-2 text-sm font-semibold text-paper transition-colors hover:opacity-90 disabled:opacity-50 sm:flex-none"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && <p className="text-sm text-rejected">{error}</p>}
    </div>
  );
}
