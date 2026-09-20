"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { CurrentMember } from "@/lib/session";
import { Avatar } from "./Avatar";

export function NavBar({ member, signOutSlot }: { member: CurrentMember; signOutSlot: ReactNode }) {
  const pathname = usePathname();
  const links = [
    { href: "/board", label: "Board" },
    { href: "/mine", label: "Mine" },
    { href: "/history", label: "History" },
  ];
  if (member.role === "admin") {
    links.push({ href: "/admin", label: "Admin" });
  }

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex gap-1 overflow-x-auto sm:gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors ${
                  active ? "bg-accent text-accent-fg" : "text-fg/70 hover:text-fg"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Avatar id={member.id} name={member.name} />
          {signOutSlot}
        </div>
      </div>
    </nav>
  );
}
