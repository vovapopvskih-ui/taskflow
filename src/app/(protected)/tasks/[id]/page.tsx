import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommentsSection } from "@/components/tasks/comments-section";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/validations/task";
import { formatDate, formatRelative } from "@/lib/format";
import {
  ArrowLeft,
  Calendar,
  AlignLeft,
  Pencil,
  Flag,
  CircleDot,
} from "lucide-react";

export const dynamic = "force-dynamic";

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

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  // Получаем задачу
  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!task) notFound();

  // Получаем комментарии
  const { data: comments } = await supabase
    .from("comments")
    .select("id, content, created_at")
    .eq("task_id", id)
    .order("created_at", { ascending: false });

  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue =
    dueDate && dueDate < today && task.status !== "done";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Назад */}
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Все задачи
      </Link>

      <div className="mt-4 glass rounded-2xl p-6">
        {/* Заголовок */}
        <h1
          className={
            "text-lg font-semibold text-card-foreground " +
            (task.status === "done"
              ? "line-through text-muted-foreground"
              : "")
          }
        >
          {task.title}
        </h1>

        {/* Бейджи */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant={statusVariantMap[task.status as TaskStatus]}>
            <CircleDot className="h-3 w-3" />
            {STATUS_LABELS[task.status as TaskStatus]}
          </Badge>
          <Badge variant={priorityVariantMap[task.priority as TaskPriority]}>
            <Flag className="h-3 w-3" />
            {PRIORITY_LABELS[task.priority as TaskPriority]}
          </Badge>
        </div>

        {/* Описание */}
        {task.description && (
          <div className="mt-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <AlignLeft className="h-3.5 w-3.5" />
              Описание
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-card-foreground">
              {task.description}
            </p>
          </div>
        )}

        {/* Метаданные */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {dueDate && (
            <div className="glass rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Дата выполнения
              </div>
              <p
                className={
                  "mt-1 text-sm " +
                  (isOverdue ? "text-destructive font-medium" : "text-card-foreground")
                }
              >
                {formatDate(dueDate)}
                {isOverdue && " (просрочено)"}
              </p>
            </div>
          )}
          <div className="glass rounded-xl px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">
              Создано
            </p>
            <p className="mt-1 text-sm text-card-foreground">
              {formatRelative(task.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Комментарии */}
      <div className="mt-6 glass rounded-2xl p-6">
        <CommentsSection
          taskId={task.id}
          initialComments={comments ?? []}
        />
      </div>
    </div>
  );
}
