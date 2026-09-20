import { db } from "@/db";
import { assignments, chores, completions, cycles, members } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getPendingApprovals(householdId: string) {
  return db
    .select({
      completionId: completions.id,
      choreName: chores.name,
      memberName: members.name,
      cycleNumber: cycles.number,
      completedAt: completions.completedAt,
    })
    .from(completions)
    .innerJoin(assignments, eq(completions.assignmentId, assignments.id))
    .innerJoin(chores, eq(assignments.choreId, chores.id))
    .innerJoin(members, eq(assignments.memberId, members.id))
    .innerJoin(cycles, eq(assignments.cycleId, cycles.id))
    .where(and(eq(cycles.householdId, householdId), eq(completions.status, "done")));
}
