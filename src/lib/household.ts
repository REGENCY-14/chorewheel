import { db } from "@/db";
import { households } from "@/db/schema";

/**
 * v1 assumption (confirmed with the product owner): one household per
 * deployment. Everything — onboarding, session resolution — resolves
 * against whichever household was seeded first, rather than letting a user
 * pick or create one.
 */
export async function getDefaultHousehold() {
  const [household] = await db.select().from(households).limit(1);
  return household ?? null;
}
