"use server";

import { signIn } from "@/auth";

export async function sendMagicLink(formData: FormData) {
  const email = formData.get("email");
  if (typeof email !== "string" || !email) return;
  await signIn("resend", { email, redirectTo: "/" });
}
