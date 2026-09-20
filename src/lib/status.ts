export type CompletionStatus = "pending" | "done" | "approved" | "rejected";

export const STATUS_META: Record<
  CompletionStatus,
  { label: string; edge: string; text: string }
> = {
  pending: { label: "Pending", edge: "border-l-pending", text: "text-pending" },
  done: { label: "Done", edge: "border-l-review", text: "text-review" },
  approved: { label: "Approved", edge: "border-l-approved", text: "text-approved" },
  rejected: { label: "Rejected", edge: "border-l-rejected", text: "text-rejected" },
};
