import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/sign-in" });
      }}
    >
      <button type="submit" className="text-sm text-black/60 hover:underline dark:text-white/60">
        Sign out
      </button>
    </form>
  );
}
