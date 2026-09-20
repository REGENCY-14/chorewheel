import { NextResponse } from "next/server";
import { db } from "@/db";
import { assignments, chorePools, chores, completions, cycles, members } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { pickAssignments, type ChorePools, type LastAssigned } from "@/lib/chores/pickAssignments";
import { endOfWeekDeadline } from "@/lib/chores/deadline";
import { notifyAssignment } from "@/lib/notify";
import { desc, eq, inArray } from "drizzle-orm";

export async function POST() {
  try {
    const admin = await requireAdmin();

    const [householdMembers, householdChores] = await Promise.all([
      db.select().from(members).where(eq(members.householdId, admin.householdId)),
      db
        .select()
        .from(chores)
        .where(eq(chores.householdId, admin.householdId)),
    ]);
    const activeChores = householdChores.filter((c) => c.active);

    if (householdMembers.length === 0 || activeChores.length === 0) {
      return NextResponse.json(
        { error: "Household needs at least one member and one active chore" },
        { status: 400 }
      );
    }

    const pools = await db
      .select()
      .from(chorePools)
      .where(
        inArray(
          chorePools.choreId,
          activeChores.map((c) => c.id)
        )
      );
    const poolsByChore: ChorePools = {};
    for (const chore of activeChores) {
      poolsByChore[chore.id] = pools.find((p) => p.choreId === chore.id)?.remainingMemberIds ?? [];
    }

    const [lastCycle] = await db
      .select()
      .from(cycles)
      .where(eq(cycles.householdId, admin.householdId))
      .orderBy(desc(cycles.number))
      .limit(1);

    const lastAssigned: LastAssigned = {};
    if (lastCycle) {
      const lastAssignments = await db
        .select()
        .from(assignments)
        .where(eq(assignments.cycleId, lastCycle.id));
      for (const a of lastAssignments) {
        lastAssigned[a.choreId] = a.memberId;
      }
    }

    const { assignments: picked, updatedPools } = pickAssignments(
      householdMembers,
      activeChores,
      poolsByChore,
      lastAssigned
    );

    const [cycle] = await db
      .insert(cycles)
      .values({
        householdId: admin.householdId,
        number: (lastCycle?.number ?? 0) + 1,
        deadlineAt: endOfWeekDeadline(),
      })
      .returning();

    const createdAssignments = await db
      .insert(assignments)
      .values(picked.map((a) => ({ cycleId: cycle.id, choreId: a.choreId, memberId: a.memberId })))
      .returning();

    await db.insert(completions).values(
      createdAssignments.map((a) => ({ assignmentId: a.id, status: "pending" as const }))
    );

    for (const choreId of Object.keys(updatedPools)) {
      await db
        .update(chorePools)
        .set({ remainingMemberIds: updatedPools[choreId] })
        .where(eq(chorePools.choreId, choreId));
    }

    for (const a of picked) {
      await notifyAssignment(a.memberId, a.choreId);
    }

    return NextResponse.json({ cycle, assignments: createdAssignments }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
