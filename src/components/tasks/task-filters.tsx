"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function TaskFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Обновление URL-параметров
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // При смене фильтра — сброс страницы на 1
      if (name !== "page") {
        params.delete("page");
      }
      return params.toString();
    },
    [searchParams],
  );

  const handleChange =
    (param: string) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      router.push(`${pathname}?${createQueryString(param, e.target.value)}`);
    };

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const priority = searchParams.get("priority") ?? "all";
  const sort = searchParams.get("sort") ?? "created_desc";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Всего: <span className="font-medium text-foreground">{total}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {/* Поиск — на всю ширину */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по названию..."
            defaultValue={search}
            onChange={handleChange("search")}
            className="w-full pl-9"
          />
        </div>

        {/* Фильтры — в строку на всех экранах */}
        <div className="flex flex-wrap gap-2">
          {/* Фильтр по статусу */}
          <Select
            value={status}
            onChange={handleChange("status")}
            className="flex-1 min-w-[120px]"
          >
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="in_progress">В работе</option>
            <option value="done">Выполненные</option>
          </Select>

          {/* Фильтр по приоритету */}
          <Select
            value={priority}
            onChange={handleChange("priority")}
            className="flex-1 min-w-[120px]"
          >
            <option value="all">Все приоритеты</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </Select>

          {/* Сортировка */}
          <Select
            value={sort}
            onChange={handleChange("sort")}
            className="flex-1 min-w-[120px]"
          >
            <option value="created_desc">Сначала новые</option>
            <option value="created_asc">Сначала старые</option>
            <option value="title_asc">По названию (А-Я)</option>
            <option value="title_desc">По названию (Я-А)</option>
            <option value="priority_desc">По приоритету ↓</option>
            <option value="priority_asc">По приоритету ↑</option>
            <option value="due_date_asc">По дате ↑</option>
            <option value="due_date_desc">По дате ↓</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
