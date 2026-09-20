"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Chore = { id: string; name: string; active: boolean };

export function ChoreSection({ chores }: { chores: Chore[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function addChore(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/chores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to add chore");
      }
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add chore");
    } finally {
      setPending(false);
    }
  }

  async function removeChore(id: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/chores/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to remove chore");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove chore");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">Chores</h2>
      {chores.length === 0 && (
        <p className="text-sm text-fg/70">No chores yet — add one to get the wheel started.</p>
      )}
      <ul className="flex flex-col gap-2">
        {chores.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-2.5"
          >
            <span className={c.active ? "font-medium" : "text-fg/40 line-through"}>{c.name}</span>
            {c.active && (
              <button
                onClick={() => removeChore(c.id)}
                disabled={pending}
                className="text-sm font-medium text-rejected hover:underline disabled:opacity-50"
              >
                Deactivate
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={addChore} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Chore name"
          required
          className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-colors hover:opacity-90 disabled:opacity-60"
        >
          Add
        </button>
      </form>
      {error && <p className="text-sm text-rejected">{error}</p>}
    </section>
  );
}
