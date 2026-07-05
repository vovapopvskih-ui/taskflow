import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "new" | "in_progress" | "done" | "low" | "medium" | "high";
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  new: "bg-status-new/15 text-status-new border-status-new/25",
  in_progress: "bg-status-progress/15 text-status-progress border-status-progress/25",
  done: "bg-status-done/15 text-status-done border-status-done/25",
  low: "bg-priority-low/15 text-priority-low border-priority-low/25",
  medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/25",
  high: "bg-priority-high/15 text-priority-high border-priority-high/25",
};

export function Badge({ children, variant = "new", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
