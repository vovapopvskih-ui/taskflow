"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { taskSchema } from "@/lib/validations/task";

export type TaskState = { error?: string; success?: string };

// ============================================================
// СОЗДАНИЕ ЗАДАЧИ
// ============================================================
export async function createTaskAction(
  _prev: TaskState,
  formData: FormData,
): Promise<TaskState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    due_date: (formData.get("due_date") as string) || null,
    priority: String(formData.get("priority") ?? "medium"),
    status: String(formData.get("status") ?? "new"),
  };

  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    due_date: parsed.data.due_date ?? null,
    priority: parsed.data.priority,
    status: parsed.data.status,
  });

  if (error) {
    return { error: "Ошибка создания задачи" };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: "Задача создана" };
}

// ============================================================
// ОБНОВЛЕНИЕ ЗАДАЧИ
// ============================================================
export async function updateTaskAction(
  _prev: TaskState,
  formData: FormData,
): Promise<TaskState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const taskId = String(formData.get("id") ?? "");
  if (!taskId) return { error: "ID задачи обязателен" };

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    due_date: (formData.get("due_date") as string) || null,
    priority: String(formData.get("priority") ?? "medium"),
    status: String(formData.get("status") ?? "new"),
  };

  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      due_date: parsed.data.due_date ?? null,
      priority: parsed.data.priority,
      status: parsed.data.status,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Ошибка обновления задачи" };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: "Задача обновлена" };
}

// ============================================================
// УДАЛЕНИЕ ЗАДАЧИ
// ============================================================
export async function deleteTaskAction(
  taskId: string,
): Promise<TaskState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Ошибка удаления задачи" };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: "Задача удалена" };
}

// ============================================================
// ИЗМЕНЕНИЕ СТАТУСА (для Kanban Drag&Drop)
// ============================================================
export async function updateTaskStatusAction(
  taskId: string,
  status: string,
): Promise<TaskState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  // Валидация статуса
  const validStatuses = ["new", "in_progress", "done"];
  if (!validStatuses.includes(status)) {
    return { error: "Некорректный статус" };
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Ошибка изменения статуса" };
  }

  revalidatePath("/kanban");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: "Статус обновлён" };
}
