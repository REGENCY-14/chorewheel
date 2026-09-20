import { db } from "@/db";
import { chorePools, chores, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { resetPoolsForRoster } from "@/lib/chores/pickAssignments";

/**
 * Resets every chore's pool to the household's current member list. Must be
 * called whenever a member is added or removed (see the reset rule).
 */
export async function resetHouseholdPools(householdId: string) {
  const [householdChores, householdMembers] = await Promise.all([
    db.select().from(chores).where(eq(chores.householdId, householdId)),
    db.select().from(members).where(eq(members.householdId, householdId)),
  ]);

  const pools = resetPoolsForRoster(householdChores, householdMembers);

  for (const chore of householdChores) {
    await db
      .insert(chorePools)
      .values({ choreId: chore.id, remainingMemberIds: pools[chore.id] })
      .onConflictDoUpdate({
        target: chorePools.choreId,
        set: { remainingMemberIds: pools[chore.id] },
      });
  }
}
