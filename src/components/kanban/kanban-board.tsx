"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import { updateTaskStatusAction } from "@/app/(protected)/tasks/actions";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { toast } from "sonner";
import {
  STATUS_LABELS,
  type TaskStatus,
  type Task,
} from "@/lib/validations/task";

interface KanbanBoardProps {
  tasks: Task[];
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "new", label: STATUS_LABELS.new },
  { id: "in_progress", label: STATUS_LABELS.in_progress },
  { id: "done", label: STATUS_LABELS.done },
];

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const supabase = createClient();

  // PointerSensor — для мыши, TouchSensor — для телефона/планшета.
  // activationConstraint: delay 200ms + tolerance 8px — чтобы тап не запускал drag,
  // а только удержание + движение.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = String(active.id);
    const newStatus = String(over.id) as TaskStatus;

    // Оптимистичное обновление UI
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Вызываем server action
    const result = await updateTaskStatusAction(taskId, newStatus);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        `Перемещено в «${STATUS_LABELS[newStatus]}»`,
      );
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              label={column.label}
              tasks={columnTasks}
              count={columnTasks.length}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
