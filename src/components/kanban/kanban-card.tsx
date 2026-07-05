"use client";

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { type Task, type TaskPriority, PRIORITY_LABELS } from "@/lib/validations/task";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/format";

interface KanbanCardProps {
  task: Task;
  isOverlay?: boolean;
}

const priorityVariantMap = {
  low: "low",
  medium: "medium",
  high: "high",
} as const;

export function KanbanCard({ task, isOverlay = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue =
    dueDate && dueDate < today && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "glass cursor-grab rounded-xl p-3 transition-all active:cursor-grabbing",
        "touch-none select-none",
        isDragging && !isOverlay && "opacity-50",
        isOverlay && "glass-strong rotate-2",
      )}
    >
      <p
        className={cn(
          "text-sm font-medium text-card-foreground",
          task.status === "done" && "line-through text-muted-foreground",
        )}
      >
        {task.title}
      </p>

      {task.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge variant={priorityVariantMap[task.priority]}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        {dueDate && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs",
              isOverdue ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
