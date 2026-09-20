import { redirect } from "next/navigation";
import { getSessionState } from "@/lib/session";

export default async function Home() {
  const state = await getSessionState();
  if (state.status === "member") redirect("/board");
  if (state.status === "unclaimed") redirect("/onboarding");
  redirect("/sign-in");
}
