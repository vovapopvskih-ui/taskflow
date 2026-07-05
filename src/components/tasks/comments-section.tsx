"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  addCommentAction,
  deleteCommentAction,
  type CommentState,
} from "@/app/(protected)/tasks/[id]/comment-actions";
import { toast } from "sonner";
import { Trash2, MessageSquare } from "lucide-react";
import { formatRelative } from "@/lib/format";

interface Comment {
  id: string;
  content: string;
  created_at: string;
}

interface CommentsSectionProps {
  taskId: string;
  initialComments: Comment[];
}

export function CommentsSection({
  taskId,
  initialComments,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [state, formAction, isPending] = useActionState<CommentState, FormData>(
    addCommentAction,
    {},
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      // Добавляем комментарий локально (оптимистично)
      // Полный список обновится после revalidate через revalidatePath
      const form = document.getElementById(
        "comment-form",
      ) as HTMLFormElement | null;
      form?.reset();
      window.location.reload();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteCommentAction(deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(result?.success || "Удалено");
      setComments((prev) => prev.filter((c) => c.id !== deleteTarget));
    }
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
        <MessageSquare className="h-4 w-4" />
        Комментарии ({comments.length})
      </h2>

      {/* Список комментариев */}
      <div className="mt-4 space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Пока нет комментариев. Будьте первым!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-md border border-border bg-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 whitespace-pre-wrap text-sm text-card-foreground">
                  {comment.content}
                </p>
                <button
                  onClick={() => setDeleteTarget(comment.id)}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Удалить комментарий"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatRelative(comment.created_at)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Форма добавления */}
      <form id="comment-form" action={formAction} className="mt-4">
        <input type="hidden" name="taskId" value={taskId} />
        <textarea
          name="content"
          rows={3}
          placeholder="Написать комментарий..."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner size="sm" className="mr-2 text-current" />
                Отправка...
              </>
            ) : (
              "Отправить"
            )}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Удалить комментарий?"
        description="Комментарий будет удалён безвозвратно."
        confirmText={deleting ? "Удаление..." : "Удалить"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
