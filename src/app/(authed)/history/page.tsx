import { getCurrentMember } from "@/lib/session";
import { getCycleAssignments } from "@/lib/cycle-data";
import { StatusBadge } from "@/components/StatusBadge";
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
      <h1 className="text-2xl font-semibold">History</h1>

      {cyclesWithRows.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">No past cycles yet.</p>
      )}

      {cyclesWithRows.map(({ cycle, rows }) => (
        <section key={cycle.id} className="flex flex-col gap-2">
          <h2 className="font-medium">
            Cycle #{cycle.number} · due {new Date(cycle.deadlineAt).toLocaleDateString()}
          </h2>
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
        </section>
      ))}
    </div>
  );
}
