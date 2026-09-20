import { db } from "@/db";
import { assignments, chores, completions, cycles, members } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getLatestCycle(householdId: string) {
  const [cycle] = await db
    .select()
    .from(cycles)
    .where(eq(cycles.householdId, householdId))
    .orderBy(desc(cycles.number))
    .limit(1);
  return cycle ?? null;
}

export type CycleAssignmentRow = {
  assignmentId: string;
  choreId: string;
  choreName: string;
  memberId: string;
  memberName: string;
  completionId: string;
  status: "pending" | "done" | "approved" | "rejected";
  completedAt: Date | null;
};

export async function getCycleAssignments(cycleId: string): Promise<CycleAssignmentRow[]> {
  const rows = await db
    .select({
      assignmentId: assignments.id,
      choreId: chores.id,
      choreName: chores.name,
      memberId: members.id,
      memberName: members.name,
      completionId: completions.id,
      status: completions.status,
      completedAt: completions.completedAt,
    })
    .from(assignments)
    .innerJoin(chores, eq(assignments.choreId, chores.id))
    .innerJoin(members, eq(assignments.memberId, members.id))
    .innerJoin(completions, eq(completions.assignmentId, assignments.id))
    .where(eq(assignments.cycleId, cycleId));

  return rows;
}
