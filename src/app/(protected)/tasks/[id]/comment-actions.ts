"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type CommentState = { error?: string; success?: string };

const commentSchema = z.object({
  taskId: z.string().uuid(),
  content: z
    .string()
    .min(1, "Введите комментарий")
    .max(2000, "Комментарий слишком длинный (макс. 2000 символов)")
    .trim(),
});

// ============================================================
// ДОБАВИТЬ КОММЕНТАРИЙ
// ============================================================
export async function addCommentAction(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const parsed = commentSchema.safeParse({
    taskId: String(formData.get("taskId") ?? ""),
    content: String(formData.get("content") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Проверяем что задача принадлежит пользователю
  const { data: task } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", parsed.data.taskId)
    .eq("user_id", user.id)
    .single();

  if (!task) {
    return { error: "Задача не найдена" };
  }

  const { error } = await supabase.from("comments").insert({
    task_id: parsed.data.taskId,
    user_id: user.id,
    content: parsed.data.content,
  });

  if (error) {
    return { error: "Ошибка добавления комментария" };
  }

  revalidatePath(`/tasks/${parsed.data.taskId}`);
  return { success: "Комментарий добавлен" };
}

// ============================================================
// УДАЛИТЬ КОММЕНТАРИЙ
// ============================================================
export async function deleteCommentAction(
  commentId: string,
): Promise<CommentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Ошибка удаления комментария" };
  }

  return { success: "Комментарий удалён" };
}
