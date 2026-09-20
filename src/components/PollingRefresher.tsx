"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// SWR-style polling fallback (chosen over Pusher Channels): re-fetches the
// page every `intervalMs` so completions/approvals made elsewhere show up
// without a manual reload. Trade-off: up to `intervalMs` of lag and a
// request per open tab even when nothing changed.
export function PollingRefresher({ intervalMs = 7000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return null;
}
