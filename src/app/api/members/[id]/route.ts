import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { resetHouseholdPools } from "@/lib/chores/reset-pools";
import { and, eq } from "drizzle-orm";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const [deleted] = await db
      .delete(members)
      .where(and(eq(members.id, id), eq(members.householdId, admin.householdId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await resetHouseholdPools(admin.householdId);

    return NextResponse.json({ member: deleted });
  } catch (error) {
    return handleApiError(error);
  }
}
