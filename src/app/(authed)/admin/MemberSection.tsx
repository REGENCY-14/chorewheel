"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";

type Member = { id: string; name: string; role: "admin" | "member" };

export function MemberSection({ members }: { members: Member[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to add member");
      }
      setName("");
      setRole("member");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setPending(false);
    }
  }

  async function removeMember(id: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to remove member");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">Members</h2>
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-2.5"
          >
            <span className="flex items-center gap-3">
              <Avatar id={m.id} name={m.name} />
              <span>
                {m.name} <span className="text-xs text-fg/60">({m.role})</span>
              </span>
            </span>
            <button
              onClick={() => removeMember(m.id)}
              disabled={pending}
              className="text-sm font-medium text-rejected hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addMember} className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "member")}
          className="rounded-md border border-border bg-surface px-2 py-2 text-sm"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
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
