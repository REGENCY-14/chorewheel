import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export type CurrentMember = {
  id: string;
  householdId: string;
  name: string;
  role: "admin" | "member";
};

export type SessionState =
  | { status: "signed-out" }
  | { status: "unclaimed"; userId: string; email: string | null }
  | { status: "member"; member: CurrentMember };

function toCurrentMember(member: typeof members.$inferSelect): CurrentMember {
  return { id: member.id, householdId: member.householdId, name: member.name, role: member.role };
}

/**
 * Resolves the full sign-in state: signed out, signed in but hasn't claimed
 * a member row yet (send them to /onboarding), or fully signed in.
 */
export async function getSessionState(): Promise<SessionState> {
  const session = await auth();

  if (session?.user?.id) {
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.userId, session.user.id))
      .limit(1);
    if (member) {
      return { status: "member", member: toCurrentMember(member) };
    }
    return { status: "unclaimed", userId: session.user.id, email: session.user.email ?? null };
  }

  // Dev-only escape hatch so the app works without a configured email
  // provider. Never falls back to this in production.
  if (process.env.NODE_ENV !== "production" && process.env.DEV_MEMBER_ID) {
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, process.env.DEV_MEMBER_ID))
      .limit(1);
    if (member) {
      return { status: "member", member: toCurrentMember(member) };
    }
  }

  return { status: "signed-out" };
}

export async function getCurrentMember(): Promise<CurrentMember | null> {
  const state = await getSessionState();
  return state.status === "member" ? state.member : null;
}

export async function requireMember(): Promise<CurrentMember> {
  const member = await getCurrentMember();
  if (!member) {
    throw new SessionError(401, "Not signed in");
  }
  return member;
}

export async function requireAdmin(): Promise<CurrentMember> {
  const member = await requireMember();
  if (member.role !== "admin") {
    throw new SessionError(403, "Admin only");
  }
  return member;
}

export class SessionError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
