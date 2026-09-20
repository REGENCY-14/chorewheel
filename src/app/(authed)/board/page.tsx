import { getCurrentMember } from "@/lib/session";
import { getCycleAssignments, getLatestCycle } from "@/lib/cycle-data";
import { StatusBadge } from "@/components/StatusBadge";
import { PollingRefresher } from "@/components/PollingRefresher";

export default async function BoardPage() {
  const member = await getCurrentMember();
  if (!member) return null;

  const cycle = await getLatestCycle(member.householdId);
  const rows = cycle ? await getCycleAssignments(cycle.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">This week&apos;s board</h1>
        {cycle ? (
          <p className="text-sm text-black/60 dark:text-white/60">
            Cycle #{cycle.number} · due {new Date(cycle.deadlineAt).toLocaleString()}
          </p>
        ) : (
          <p className="text-sm text-black/60 dark:text-white/60">
            No cycle has been generated yet. Ask an admin to generate one.
          </p>
        )}
      </div>

      <PollingRefresher />

      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.assignmentId}
            className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
          >
            <div>
              <p className="font-medium">{row.choreName}</p>
              <p className="text-sm text-black/60 dark:text-white/60">{row.memberName}</p>
            </div>
            <StatusBadge status={row.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
