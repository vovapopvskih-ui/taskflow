"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/tasks/task-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteTaskAction } from "@/app/(protected)/tasks/actions";
import { toast } from "sonner";
import { Pencil, Trash2, Calendar, AlignLeft } from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/validations/task";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
}

interface TaskCardProps {
  task: Task;
}

const statusVariantMap = {
  new: "new",
  in_progress: "in_progress",
  done: "done",
} as const;

const priorityVariantMap = {
  low: "low",
  medium: "medium",
  high: "high",
} as const;

export function TaskCard({ task }: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteTaskAction(task.id);
    setDeleting(false);
    setConfirmOpen(false);
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(result.success);
    }
  }

  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue =
    dueDate && dueDate < today && task.status !== "done";

  return (
    <>
      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.01] hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/tasks/${task.id}`} className="block">
              <h3
                className={
                  "text-sm font-medium text-card-foreground hover:text-primary transition-colors " +
                  (task.status === "done" ? "line-through text-muted-foreground" : "")
                }
              >
                {task.title}
              </h3>
            </Link>

            {task.description && (
              <div className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                <AlignLeft className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <p className="line-clamp-2">{task.description}</p>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={statusVariantMap[task.status]}>
                {STATUS_LABELS[task.status]}
              </Badge>
              <Badge variant={priorityVariantMap[task.priority]}>
                {PRIORITY_LABELS[task.priority]}
              </Badge>
              {dueDate && (
                <span
                  className={
                    "inline-flex items-center gap-1 text-xs " +
                    (isOverdue ? "text-destructive" : "text-muted-foreground")
                  }
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(dueDate)}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditOpen(true)}
              aria-label="Редактировать"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              aria-label="Удалить"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {editOpen && (
        <TaskForm
          mode="edit"
          taskId={task.id}
          defaultValues={{
            title: task.title,
            description: task.description ?? "",
            due_date: task.due_date,
            priority: task.priority,
            status: task.status,
          }}
          onClose={() => setEditOpen(false)}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Вы уверены?"
        description={`Задача «${task.title}» будет удалена безвозвратно.`}
        confirmText={deleting ? "Удаление..." : "Удалить"}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
