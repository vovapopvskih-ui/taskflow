"use client";

import { useState } from "react";
import { TaskCard, type Task } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Plus, Inbox, Search } from "lucide-react";

interface TaskListClientProps {
  tasks: Task[];
  canCreate: boolean;
}

export function TaskListClient({ tasks, canCreate }: TaskListClientProps) {
  const [createOpen, setCreateOpen] = useState(false);

  // Пустое состояние
  if (tasks.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-medium text-foreground">
            Задач пока нет
          </h3>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Создайте первую задачу, чтобы начать управлять своими делами.
          </p>
          {canCreate && (
            <Button
              className="mt-4"
              size="sm"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать задачу
            </Button>
          )}
        </div>

        {createOpen && (
          <TaskForm mode="create" onClose={() => setCreateOpen(false)} />
        )}
      </>
    );
  }

  return (
    <>
      {/* Кнопка создать (сверху списка) */}
      {canCreate && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Создать задачу
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {createOpen && (
        <TaskForm mode="create" onClose={() => setCreateOpen(false)} />
      )}
    </>
  );
}
