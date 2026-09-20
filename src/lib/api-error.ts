import { NextResponse } from "next/server";
import { SessionError } from "@/lib/session";

export function handleApiError(error: unknown) {
  if (error instanceof SessionError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
