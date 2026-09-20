import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { chorePools, chores } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

const createChoreSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = createChoreSchema.parse(await request.json());

    const [chore] = await db
      .insert(chores)
      .values({ householdId: admin.householdId, name: body.name })
      .returning();

    await db.insert(chorePools).values({ choreId: chore.id, remainingMemberIds: [] });

    return NextResponse.json({ chore }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
