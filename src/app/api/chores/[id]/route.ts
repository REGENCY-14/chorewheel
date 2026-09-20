import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chores } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { and, eq } from "drizzle-orm";

// Soft delete: keep the row (and its history) around, just stop scheduling
// it in future cycles, since assignments/completions reference chore_id.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const [deactivated] = await db
      .update(chores)
      .set({ active: false })
      .where(and(eq(chores.id, id), eq(chores.householdId, admin.householdId)))
      .returning();

    if (!deactivated) {
      return NextResponse.json({ error: "Chore not found" }, { status: 404 });
    }

    return NextResponse.json({ chore: deactivated });
  } catch (error) {
    return handleApiError(error);
  }
}
