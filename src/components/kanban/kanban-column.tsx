"use client";

import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { type Task, type TaskStatus } from "@/lib/validations/task";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  count: number;
}

export function KanbanColumn({ id, label, tasks, count }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[200px] flex-col rounded-2xl p-3 transition-all glass",
        isOver && "ring-2 ring-primary",
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-medium text-secondary-foreground backdrop-blur-sm">
          {count}
        </span>
      </div>

      <div className="flex-1 space-y-2">
        {tasks.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
            Перетащите сюда
          </div>
        ) : (
          tasks.map((task) => <KanbanCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
