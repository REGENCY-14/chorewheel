import Link from "next/link";
import type { CurrentMember } from "@/lib/session";
import { SignOutButton } from "./SignOutButton";

export function NavBar({ member }: { member: CurrentMember }) {
  const links = [
    { href: "/board", label: "Board" },
    { href: "/mine", label: "Mine" },
    { href: "/history", label: "History" },
  ];
  if (member.role === "admin") {
    links.push({ href: "/admin", label: "Admin" });
  }

  return (
    <nav className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-black/60 dark:text-white/60">{member.name}</span>
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
