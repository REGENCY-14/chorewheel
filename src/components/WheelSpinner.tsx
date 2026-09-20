"use client";

// The one non-user-triggered animation in the app: a literal spinning wheel,
// shown for ~1.5s while a new cycle is generated. Nothing else in the UI
// animates on its own — see WHEEL_SPIN_MS in GenerateCycleButton.
const WEDGE_COLORS = [
  "var(--denim)",
  "var(--marigold)",
  "var(--moss)",
  "var(--clay)",
  "var(--denim)",
  "var(--marigold)",
  "var(--moss)",
  "var(--clay)",
];

function wedgePath(index: number, count: number) {
  const start = (index / count) * 2 * Math.PI - Math.PI / 2;
  const end = ((index + 1) / count) * 2 * Math.PI - Math.PI / 2;
  const cx = 50;
  const cy = 50;
  const r = 46;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}

export function WheelSpinner({ label = "Spinning the wheel…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/60 backdrop-blur-sm"
    >
      <div className="relative h-40 w-40">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full animate-[wheel-spin_1.5s_cubic-bezier(0.2,0.7,0.2,1)_forwards]"
          style={{ ["--wheel-final-angle" as string]: "1440deg" }}
        >
          <circle cx="50" cy="50" r="48" fill="var(--ink)" />
          {WEDGE_COLORS.map((color, i) => (
            <path key={i} d={wedgePath(i, WEDGE_COLORS.length)} fill={color} />
          ))}
          <circle cx="50" cy="50" r="6" fill="var(--paper)" />
        </svg>
        <div
          className="absolute left-1/2 top-[-6px] h-0 w-0 -translate-x-1/2"
          style={{
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "12px solid var(--paper)",
          }}
        />
      </div>
      <p className="text-sm font-medium text-paper">{label}</p>
    </div>
  );
}
