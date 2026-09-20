import type { ReactNode } from "react";
import { Avatar } from "./Avatar";
import { STATUS_META, type CompletionStatus } from "@/lib/status";

export function Ticket({
  choreName,
  memberId,
  memberName,
  status,
  actions,
}: {
  choreName: string;
  memberId: string;
  memberName: string;
  status: CompletionStatus;
  actions?: ReactNode;
}) {
  const meta = STATUS_META[status];

  return (
    <li
      className={`flex flex-col gap-3 rounded-md border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-l-4 ${meta.edge}`}
    >
      <div className="flex items-center gap-3">
        <Avatar id={memberId} name={memberName} />
        <div className="flex flex-col">
          <span className="text-base font-semibold leading-tight">{choreName}</span>
          <span className="text-sm text-fg/70">{memberName}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
        <span className={`text-sm font-medium ${meta.text}`}>{meta.label}</span>
        {actions}
      </div>
    </li>
  );
}
