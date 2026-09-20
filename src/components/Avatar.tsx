const PALETTE = [
  { bg: "bg-denim", text: "text-paper" },
  { bg: "bg-moss", text: "text-paper" },
  { bg: "bg-marigold", text: "text-ink" },
  { bg: "bg-clay", text: "text-paper" },
] as const;

function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function Avatar({ id, name }: { id: string; name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const { bg, text } = colorFor(id);
  return (
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${bg} ${text}`}
    >
      {initial}
    </span>
  );
}
