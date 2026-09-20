import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { assignments, completions, cycles } from "@/db/schema";
import { requireMember } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { eq } from "drizzle-orm";

const patchSchema = z.object({
  status: z.enum(["done", "approved", "rejected"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requester = await requireMember();
    const { id } = await params;
    const { status } = patchSchema.parse(await request.json());

    const [row] = await db
      .select({
        completion: completions,
        assignment: assignments,
        cycle: cycles,
      })
      .from(completions)
      .innerJoin(assignments, eq(completions.assignmentId, assignments.id))
      .innerJoin(cycles, eq(assignments.cycleId, cycles.id))
      .where(eq(completions.id, id))
      .limit(1);

    if (!row || row.cycle.householdId !== requester.householdId) {
      return NextResponse.json({ error: "Completion not found" }, { status: 404 });
    }

    if (status === "done") {
      const isOwnAssignment = row.assignment.memberId === requester.id;
      const fromValidStatus = row.completion.status === "pending" || row.completion.status === "rejected";
      if (!isOwnAssignment || !fromValidStatus) {
        return NextResponse.json(
          { error: "You can only mark your own pending or rejected assignments as done" },
          { status: 403 }
        );
      }
    } else {
      if (requester.role !== "admin") {
        return NextResponse.json({ error: "Only an admin can approve or reject" }, { status: 403 });
      }
      if (row.completion.status !== "done") {
        return NextResponse.json(
          { error: "Only completions marked done can be approved or rejected" },
          { status: 400 }
        );
      }
    }

    const [updated] = await db
      .update(completions)
      .set({
        status,
        completedAt: status === "done" ? new Date() : row.completion.completedAt,
      })
      .where(eq(completions.id, id))
      .returning();

    return NextResponse.json({ completion: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
