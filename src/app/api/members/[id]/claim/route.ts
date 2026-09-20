import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { auth } from "@/auth";
import { getDefaultHousehold } from "@/lib/household";
import { and, eq, isNull } from "drizzle-orm";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const household = await getDefaultHousehold();
  if (!household) {
    return NextResponse.json({ error: "No household configured" }, { status: 400 });
  }

  const { id } = await params;

  const [claimed] = await db
    .update(members)
    .set({ userId: session.user.id, email: session.user.email ?? undefined })
    .where(
      and(
        eq(members.id, id),
        eq(members.householdId, household.id),
        isNull(members.userId)
      )
    )
    .returning();

  if (!claimed) {
    return NextResponse.json(
      { error: "That member is unavailable to claim" },
      { status: 409 }
    );
  }

  return NextResponse.json({ member: claimed });
}
