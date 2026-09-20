import { db } from "@/db";
import { households, members, chores, chorePools } from "@/db/schema";

async function main() {
  const [household] = await db
    .insert(households)
    .values({ name: "Dev Household" })
    .returning();

  const [admin1, admin2, member1, member2] = await db
    .insert(members)
    .values([
      { householdId: household.id, name: "Alex (Admin)", role: "admin" },
      { householdId: household.id, name: "Sam (Admin)", role: "admin" },
      { householdId: household.id, name: "Jordan", role: "member" },
      { householdId: household.id, name: "Riley", role: "member" },
    ])
    .returning();

  const createdChores = await db
    .insert(chores)
    .values([
      { householdId: household.id, name: "Dishes" },
      { householdId: household.id, name: "Trash" },
      { householdId: household.id, name: "Vacuum" },
      { householdId: household.id, name: "Bathroom" },
    ])
    .returning();

  const allMemberIds = [admin1.id, admin2.id, member1.id, member2.id];
  await db.insert(chorePools).values(
    createdChores.map((chore) => ({
      choreId: chore.id,
      remainingMemberIds: allMemberIds,
    }))
  );

  console.log("Seeded household:", household.id);
  console.log("Admin member (use as DEV_MEMBER_ID):", admin1.id);
  console.log("Other members:", { admin2: admin2.id, member1: member1.id, member2: member2.id });
  console.log("Chores:", createdChores.map((c) => ({ id: c.id, name: c.name })));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
