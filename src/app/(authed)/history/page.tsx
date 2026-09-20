import { getCurrentMember } from "@/lib/session";
import { getCycleAssignments } from "@/lib/cycle-data";
import { Ticket } from "@/components/Ticket";
import { db } from "@/db";
import { cycles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function HistoryPage() {
  const member = await getCurrentMember();
  if (!member) return null;

  const householdCycles = await db
    .select()
    .from(cycles)
    .where(eq(cycles.householdId, member.householdId))
    .orderBy(desc(cycles.number));

  const cyclesWithRows = await Promise.all(
    householdCycles.map(async (cycle) => ({
      cycle,
      rows: await getCycleAssignments(cycle.id),
    }))
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">History</h1>

      {cyclesWithRows.length === 0 && (
        <p className="text-sm text-fg/70">No past cycles yet — this fills in after the first one runs.</p>
      )}

      {cyclesWithRows.map(({ cycle, rows }) => (
        <section key={cycle.id} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-fg/70">
            Cycle #{cycle.number} · due {new Date(cycle.deadlineAt).toLocaleDateString()}
          </h2>
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
        </section>
      ))}
    </div>
  );
}
