"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WheelSpinner } from "@/components/WheelSpinner";

const WHEEL_SPIN_MS = 1500;

export function GenerateCycleButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setSpinning(true);
    setError(null);

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion: skip the wheel overlay entirely and just swap the
    // button label while the request is in flight — no substitute
    // animation, per the spec's "skip, don't replace" instruction.
    if (!reducedMotion) setShowWheel(true);

    const minDelay = reducedMotion
      ? Promise.resolve()
      : new Promise((resolve) => setTimeout(resolve, WHEEL_SPIN_MS));

    try {
      const [res] = await Promise.all([
        fetch("/api/cycles/generate", { method: "POST" }),
        minDelay,
      ]);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to generate cycle");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate cycle");
    } finally {
      setSpinning(false);
      setShowWheel(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={generate}
        disabled={spinning}
        className="w-fit rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {spinning ? "Spinning the wheel…" : "Generate new cycle"}
      </button>
      {error && <p className="text-sm text-rejected">{error}</p>}
      {showWheel && <WheelSpinner />}
    </div>
  );
}
