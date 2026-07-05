import { z } from "zod";

/**
 * Валидация задач.
 * Поля по ТЗ: название, описание, дата, приоритет, статус.
 */

export const taskStatusEnum = z.enum(["new", "in_progress", "done"]);
export const taskPriorityEnum = z.enum(["low", "medium", "high"]);

export const taskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .min(1, "Введите название задачи")
    .max(200, "Название не должно превышать 200 символов")
    .trim(),
  description: z
    .string()
    .max(2000, "Описание не должно превышать 2000 символов")
    .trim()
    .default(""),
  due_date: z.string().nullable().optional(),
  priority: taskPriorityEnum.default("medium"),
  status: taskStatusEnum.default("new"),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskStatus = z.infer<typeof taskStatusEnum>;
export type TaskPriority = z.infer<typeof taskPriorityEnum>;

/**
 * Полная задача из БД (с id и датами).
 */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Метки для отображения статусов и приоритетов на русском.
 */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Выполнена",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};
