import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TaskCard, type Task } from "@/components/tasks/task-card";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskPagination } from "@/components/tasks/task-pagination";
import { TaskListClient } from "@/components/tasks/task-list-client";
import { TaskExportImport } from "@/components/tasks/task-export-import";
import { Button } from "@/components/ui/button";
import { Plus, Inbox } from "lucide-react";
import { type TaskPriority, type TaskStatus } from "@/lib/validations/task";

export const metadata: Metadata = {
  title: "Задачи — TaskFlow",
  description: "Управляйте своими задачами: создание, поиск, фильтры, сортировка.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

// Карта сортировки → [колонка, направление]
const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  created_desc: { column: "created_at", ascending: false },
  created_asc: { column: "created_at", ascending: true },
  title_asc: { column: "title", ascending: true },
  title_desc: { column: "title", ascending: false },
  priority_desc: { column: "priority", ascending: false },
  priority_asc: { column: "priority", ascending: true },
  due_date_asc: { column: "due_date", ascending: true },
  due_date_desc: { column: "due_date", ascending: false },
};

// Приоритет для сортировки: high=3, medium=2, low=1
const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 } as const;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const priority =
    typeof params.priority === "string" ? params.priority : "all";
  const sort = typeof params.sort === "string" ? params.sort : "created_desc";
  const page = Math.max(
    1,
    parseInt(typeof params.page === "string" ? params.page : "1", 10) || 1,
  );

  // --- Построение запроса ---
  let query = supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  // Поиск
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }
  // Фильтр по статусу
  if (status !== "all") {
    query = query.eq("status", status as TaskStatus);
  }
  // Фильтр по приоритету
  if (priority !== "all") {
    query = query.eq("priority", priority as TaskPriority);
  }

  // Сортировка
  const sortConfig = SORT_MAP[sort] ?? SORT_MAP.created_desc;
  query = query.order(sortConfig.column, {
    ascending: sortConfig.ascending,
    nullsFirst: false,
  });

  // Пагинация
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: tasks, count } = await query;

  const totalTasks = count ?? 0;
  const totalPages = Math.ceil(totalTasks / PAGE_SIZE) || 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Задачи</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Управляйте своими задачами
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Фильтры + кнопка создать */}
        <div className="glass rounded-2xl p-4">
          <TaskFilters total={totalTasks} />
        </div>

        {/* Экспорт / Импорт */}
        <TaskExportImport />

        {/* Список задач */}
        <TaskListClient
          tasks={(tasks ?? []) as Task[]}
          canCreate={true}
        />

        {/* Пагинация */}
        <TaskPagination currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
