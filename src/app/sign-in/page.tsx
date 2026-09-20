import { redirect } from "next/navigation";
import { getSessionState } from "@/lib/session";
import { WheelMark } from "@/components/WheelMark";
import { sendMagicLink } from "./actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const state = await getSessionState();
  if (state.status === "member") redirect("/board");
  if (state.status === "unclaimed") redirect("/onboarding");

  const params = await searchParams;
  const sent = params.sent === "1";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <WheelMark size={44} />
        <div>
          <h1 className="text-2xl font-bold">Chore Wheel</h1>
          <p className="text-sm text-fg/70">Enter your email and we&apos;ll send you a sign-in link.</p>
        </div>
      </div>

      {sent ? (
        <p className="text-center text-sm">Check your email for a sign-in link.</p>
      ) : (
        <form action={sendMagicLink} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-colors hover:opacity-90"
          >
            Send magic link
          </button>
        </form>
      )}

      {process.env.NODE_ENV !== "production" && (
        <p className="text-xs text-fg/50">
          Dev mode: set <code>DEV_MEMBER_ID</code> in <code>.env.local</code> to a seeded member id
          (<code>npm run seed</code>) to skip email sign-in entirely.
        </p>
      )}
    </main>
  );
}
