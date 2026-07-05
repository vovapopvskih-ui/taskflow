"use server";

import { createClient } from "@/lib/supabase/server";
import { tasksToCsv, parseCsv, csvToTaskInputs } from "@/lib/csv";
import { taskSchema } from "@/lib/validations/task";

export type ExportState = { error?: string; success?: string; csv?: string };

// ============================================================
// ЭКСПОРТ ВСЕХ ЗАДАЧ В CSV
// ============================================================
export async function exportTasksCsvAction(): Promise<ExportState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, title, description, due_date, priority, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: "Ошибка получения задач" };

  const csv = tasksToCsv(tasks ?? []);
  return { success: "OK", csv };
}

// ============================================================
// ИМПОРТ ЗАДАЧ ИЗ CSV
// ============================================================
export async function importTasksCsvAction(
  _prev: ExportState,
  formData: FormData,
): Promise<ExportState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Выберите CSV-файл" };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Файл слишком большой (макс. 2 МБ)" };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  const inputs = csvToTaskInputs(rows);

  if (inputs.length === 0) {
    return { error: "В файле не найдено задач (нужна колонка «Название»)" };
  }

  // Валидируем и готовим к вставке
  const toInsert: Array<{
    user_id: string;
    title: string;
    description: string;
    due_date: string | null;
    priority: string;
    status: string;
  }> = [];

  for (const input of inputs) {
    const parsed = taskSchema.safeParse(input);
    if (parsed.success) {
      toInsert.push({
        user_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        due_date: parsed.data.due_date ?? null,
        priority: parsed.data.priority,
        status: parsed.data.status,
      });
    }
  }

  if (toInsert.length === 0) {
    return { error: "Ни одна задача не прошла валидацию" };
  }

  const { error } = await supabase.from("tasks").insert(toInsert);

  if (error) {
    return { error: "Ошибка импорта задач" };
  }

  return { success: `Импортировано задач: ${toInsert.length}` };
}
