import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { members } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { resetHouseholdPools } from "@/lib/chores/reset-pools";
import { eq } from "drizzle-orm";

const createMemberSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.enum(["admin", "member"]).default("member"),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = createMemberSchema.parse(await request.json());

    if (body.role === "admin") {
      const existingAdmins = await db
        .select()
        .from(members)
        .where(eq(members.householdId, admin.householdId));
      const adminCount = existingAdmins.filter((m) => m.role === "admin").length;
      if (adminCount >= 2) {
        return NextResponse.json(
          { error: "A household can only have two admins" },
          { status: 400 }
        );
      }
    }

    const [member] = await db
      .insert(members)
      .values({ householdId: admin.householdId, name: body.name, role: body.role })
      .returning();

    await resetHouseholdPools(admin.householdId);

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
