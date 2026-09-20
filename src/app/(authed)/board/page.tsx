import { getCurrentMember } from "@/lib/session";
import { getCycleAssignments, getLatestCycle } from "@/lib/cycle-data";
import { Ticket } from "@/components/Ticket";
import { PollingRefresher } from "@/components/PollingRefresher";

export default async function BoardPage() {
  const member = await getCurrentMember();
  if (!member) return null;

  const cycle = await getLatestCycle(member.householdId);
  const rows = cycle ? await getCycleAssignments(cycle.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">This week&apos;s board</h1>
        {cycle ? (
          <p className="text-sm text-fg/70">
            Cycle #{cycle.number} · due {new Date(cycle.deadlineAt).toLocaleString()}
          </p>
        ) : (
          <p className="text-sm text-fg/70">
            No cycle yet — an admin needs to spin the wheel to get started.
          </p>
        )}
      </div>

      <PollingRefresher />

      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <Ticket
            key={row.assignmentId}
            choreName={row.choreName}
            memberId={row.memberId}
            memberName={row.memberName}
            status={row.status}
          />
        ))}
      </ul>
    </div>
  );
}
