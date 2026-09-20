import { redirect } from "next/navigation";
import { getSessionState } from "@/lib/session";
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
      <div>
        <h1 className="text-2xl font-semibold">Chore Wheel</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Enter your email and we&apos;ll send you a sign-in link.
        </p>
      </div>

      {sent ? (
        <p className="text-sm">Check your email for a sign-in link.</p>
      ) : (
        <form action={sendMagicLink} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="rounded-md border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Send magic link
          </button>
        </form>
      )}

      {process.env.NODE_ENV !== "production" && (
        <p className="text-xs text-black/50 dark:text-white/50">
          Dev mode: set <code>DEV_MEMBER_ID</code> in <code>.env.local</code> to a seeded member id
          (<code>npm run seed</code>) to skip email sign-in entirely.
        </p>
      )}
    </main>
  );
}
