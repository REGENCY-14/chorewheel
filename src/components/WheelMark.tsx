const WEDGES = ["var(--denim)", "var(--marigold)", "var(--moss)", "var(--clay)"];

export function WheelMark({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="var(--ink)" />
      {WEDGES.map((color, i) => {
        const start = (i / WEDGES.length) * 2 * Math.PI - Math.PI / 2;
        const end = ((i + 1) / WEDGES.length) * 2 * Math.PI - Math.PI / 2;
        const x1 = 50 + 44 * Math.cos(start);
        const y1 = 50 + 44 * Math.sin(start);
        const x2 = 50 + 44 * Math.cos(end);
        const y2 = 50 + 44 * Math.sin(end);
        return <path key={i} d={`M 50 50 L ${x1} ${y1} A 44 44 0 0 1 ${x2} ${y2} Z`} fill={color} />;
      })}
      <circle cx="50" cy="50" r="7" fill="var(--paper)" />
    </svg>
  );
}
