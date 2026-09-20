import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/sign-in" });
      }}
    >
      <button type="submit" className="text-sm font-medium text-fg/70 hover:text-fg hover:underline">
        Sign out
      </button>
    </form>
  );
}
