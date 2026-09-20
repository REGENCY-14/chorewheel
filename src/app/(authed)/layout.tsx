import { redirect } from "next/navigation";
import { getSessionState } from "@/lib/session";
import { NavBar } from "@/components/NavBar";

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const state = await getSessionState();
  if (state.status === "signed-out") {
    redirect("/sign-in");
  }
  if (state.status === "unclaimed") {
    redirect("/onboarding");
  }

  return (
    <>
      <NavBar member={state.member} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
