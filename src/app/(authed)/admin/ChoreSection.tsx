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
      <h2 className="text-lg font-semibold">Chores</h2>
      <ul className="flex flex-col gap-2">
        {chores.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-2 dark:border-white/10"
          >
            <span className={c.active ? "" : "text-black/40 line-through dark:text-white/40"}>
              {c.name}
            </span>
            {c.active && (
              <button
                onClick={() => removeChore(c.id)}
                disabled={pending}
                className="text-sm text-red-600 hover:underline disabled:opacity-50"
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
          className="flex-1 rounded-md border border-black/20 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-transparent"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          Add
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </section>
  );
}
