import { redirect } from "next/navigation";
import { getSessionState } from "@/lib/session";
import { getDefaultHousehold } from "@/lib/household";
import { db } from "@/db";
import { members } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { ClaimList } from "./ClaimList";

export default async function OnboardingPage() {
  const state = await getSessionState();
  if (state.status === "signed-out") redirect("/sign-in");
  if (state.status === "member") redirect("/board");

  const household = await getDefaultHousehold();
  const unclaimed = household
    ? await db
        .select({ id: members.id, name: members.name })
        .from(members)
        .where(and(eq(members.householdId, household.id), isNull(members.userId)))
    : [];

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-bold">Which one are you?</h1>
        <p className="text-sm text-fg/70">Pick your name from the household roster to finish signing in.</p>
      </div>
      <ClaimList members={unclaimed} />
    </main>
  );
}
