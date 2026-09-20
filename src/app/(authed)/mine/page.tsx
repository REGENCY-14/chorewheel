import { getCurrentMember } from "@/lib/session";
import { getCycleAssignments, getLatestCycle } from "@/lib/cycle-data";
import { StatusBadge } from "@/components/StatusBadge";
import { MarkDoneButton } from "@/components/MarkDoneButton";
import { PollingRefresher } from "@/components/PollingRefresher";

export default async function MinePage() {
  const member = await getCurrentMember();
  if (!member) return null;

  const cycle = await getLatestCycle(member.householdId);
  const rows = cycle
    ? (await getCycleAssignments(cycle.id)).filter((row) => row.memberId === member.id)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">My chores</h1>
        {cycle && (
          <p className="text-sm text-black/60 dark:text-white/60">
            Cycle #{cycle.number} · due {new Date(cycle.deadlineAt).toLocaleString()}
          </p>
        )}
      </div>

      <PollingRefresher />

      {rows.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">
          No chores assigned to you this cycle.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.assignmentId}
            className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
          >
            <div>
              <p className="font-medium">{row.choreName}</p>
              <StatusBadge status={row.status} />
            </div>
            {(row.status === "pending" || row.status === "rejected") && (
              <MarkDoneButton completionId={row.completionId} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
