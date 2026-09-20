import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import { db } from "@/db";
import { chores, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPendingApprovals } from "@/lib/admin-data";
import { MemberSection } from "./MemberSection";
import { ChoreSection } from "./ChoreSection";
import { GenerateCycleButton } from "./GenerateCycleButton";
import { ApprovalsQueue } from "./ApprovalsQueue";
import { PollingRefresher } from "@/components/PollingRefresher";

export default async function AdminPage() {
  const member = await getCurrentMember();
  if (!member) return null;
  if (member.role !== "admin") {
    redirect("/board");
  }

  const [householdMembers, householdChores, approvals] = await Promise.all([
    db.select().from(members).where(eq(members.householdId, member.householdId)),
    db.select().from(chores).where(eq(chores.householdId, member.householdId)),
    getPendingApprovals(member.householdId),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-fg/70">Manage the household roster, chores, and weekly rotation.</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Cycle</h2>
        <GenerateCycleButton />
      </section>

      <PollingRefresher />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Approvals</h2>
        <ApprovalsQueue approvals={approvals} />
      </section>

      <MemberSection members={householdMembers} />
      <ChoreSection chores={householdChores} />
    </div>
  );
}
