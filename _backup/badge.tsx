import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "new" | "in_progress" | "done" | "low" | "medium" | "high";
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  new: "bg-status-new/10 text-status-new border-status-new/20",
  in_progress: "bg-status-progress/10 text-status-progress border-status-progress/20",
  done: "bg-status-done/10 text-status-done border-status-done/20",
  low: "bg-priority-low/10 text-priority-low border-priority-low/20",
  medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
  high: "bg-priority-high/10 text-priority-high border-priority-high/20",
};

export function Badge({ children, variant = "new", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
