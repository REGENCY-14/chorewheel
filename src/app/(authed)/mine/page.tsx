import { getCurrentMember } from "@/lib/session";
import { getCycleAssignments, getLatestCycle } from "@/lib/cycle-data";
import { Ticket } from "@/components/Ticket";
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
        <h1 className="text-2xl font-bold">My chores</h1>
        {cycle && (
          <p className="text-sm text-fg/70">
            Cycle #{cycle.number} · due {new Date(cycle.deadlineAt).toLocaleString()}
          </p>
        )}
      </div>

      <PollingRefresher />

      {rows.length === 0 && (
        <p className="text-sm text-fg/70">
          Nothing on your list this cycle — check back once the next one is generated.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <Ticket
            key={row.assignmentId}
            choreName={row.choreName}
            memberId={row.memberId}
            memberName={row.memberName}
            status={row.status}
            actions={
              (row.status === "pending" || row.status === "rejected") && (
                <MarkDoneButton completionId={row.completionId} />
              )
            }
          />
        ))}
      </ul>
    </div>
  );
}
