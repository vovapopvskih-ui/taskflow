"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  createTaskAction,
  updateTaskAction,
  type TaskState,
} from "@/app/(protected)/tasks/actions";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/validations/task";

interface TaskFormProps {
  mode: "create" | "edit";
  taskId?: string;
  defaultValues?: {
    title?: string;
    description?: string;
    due_date?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
  };
  onClose: () => void;
}

export function TaskForm({ mode, taskId, defaultValues, onClose }: TaskFormProps) {
  const action = mode === "edit" ? updateTaskAction : createTaskAction;
  const [state, formAction, isPending] = useActionState<TaskState, FormData>(
    action,
    {},
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onClose();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md my-8 glass rounded-2xl p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-card-foreground">
            {mode === "edit" ? "Редактировать задачу" : "Новая задача"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          {mode === "edit" && taskId && (
            <input type="hidden" name="id" value={taskId} />
          )}

          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-medium text-foreground">
              Название <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Что нужно сделать?"
              defaultValue={defaultValues?.title}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-medium text-foreground">
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Детали задачи..."
              defaultValue={defaultValues?.description}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="priority" className="text-xs font-medium text-foreground">
                Приоритет
              </label>
              <Select id="priority" name="priority" defaultValue={defaultValues?.priority ?? "medium"}>
                <option value="low">{PRIORITY_LABELS.low}</option>
                <option value="medium">{PRIORITY_LABELS.medium}</option>
                <option value="high">{PRIORITY_LABELS.high}</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-medium text-foreground">
                Статус
              </label>
              <Select id="status" name="status" defaultValue={defaultValues?.status ?? "new"}>
                <option value="new">{STATUS_LABELS.new}</option>
                <option value="in_progress">{STATUS_LABELS.in_progress}</option>
                <option value="done">{STATUS_LABELS.done}</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="due_date" className="text-xs font-medium text-foreground">
              Дата выполнения
            </label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              defaultValue={defaultValues?.due_date ?? ""}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner size="sm" className="mr-2 text-current" />
                  Сохранение...
                </>
              ) : mode === "edit" ? (
                "Сохранить"
              ) : (
                "Создать задачу"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
