import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/validations/task";

export interface CsvTask {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
}

/**
 * Экранирование ячейки CSV (RFC 4180).
 * Если значение содержит запятую, кавычку или перенос строки — оборачиваем в кавычки.
 */
function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Генерация CSV-строки из массива задач.
 * Добавляем BOM (\uFEFF) для корректного открытия в Excel на Windows.
 */
export function tasksToCsv(tasks: CsvTask[]): string {
  const headers = [
    "Название",
    "Описание",
    "Дата выполнения",
    "Приоритет",
    "Статус",
    "Дата создания",
  ];

  const rows = tasks.map((t) =>
    [
      t.title,
      t.description ?? "",
      t.due_date ?? "",
      PRIORITY_LABELS[t.priority],
      STATUS_LABELS[t.status],
      new Date(t.created_at).toLocaleString("ru-RU"),
    ]
      .map(escapeCell)
      .join(","),
  );

  return "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
}

/**
 * Парсинг CSV → массив объектов.
 * Поддерживает кавычки и экранирование (RFC 4180).
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;
  let i = 0;

  // Удаляем BOM если есть
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          currentCell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      currentCell += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (char === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      i++;
      continue;
    }

    if (char === "\r") {
      i++;
      continue;
    }

    if (char === "\n") {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      i++;
      continue;
    }

    currentCell += char;
    i++;
  }

  // Последняя ячейка
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  // Фильтруем пустые строки
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/**
 * Колонки для импорта (по заголовку находим индекс).
 * Поддерживает русские и английские заголовки.
 */
const HEADER_ALIASES: Record<string, string[]> = {
  title: ["название", "title", "задача", "имя"],
  description: ["описание", "description", "детали"],
  due_date: ["дата", "дата выполнения", "дедлайн", "due_date", "date", "deadline"],
  priority: ["приоритет", "priority"],
  status: ["статус", "status"],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase();
}

/**
 * Преобразует распарсенный CSV в массив задач (сырых, без валидации).
 * Первая строка — заголовки.
 */
export function csvToTaskInputs(
  rows: string[][],
): Array<Partial<CsvTask> & { title: string }> {
  if (rows.length < 2) return [];

  const headerRow = rows[0].map(normalizeHeader);
  const dataRows = rows.slice(1);

  // Находим индексы колонок
  const columnMap: Record<string, number> = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const idx = headerRow.findIndex((h) => aliases.includes(h));
    if (idx !== -1) columnMap[field] = idx;
  }

  const result: Array<Partial<CsvTask> & { title: string }> = [];

  for (const row of dataRows) {
    const title = columnMap.title !== undefined ? (row[columnMap.title] ?? "").trim() : "";
    if (!title) continue;

    result.push({
      title,
      description:
        columnMap.description !== undefined
          ? (row[columnMap.description] ?? "").trim()
          : "",
      due_date:
        columnMap.due_date !== undefined
          ? (row[columnMap.due_date] ?? "").trim() || null
          : null,
      priority: normalizePriority(
        columnMap.priority !== undefined ? row[columnMap.priority] ?? "" : "",
      ),
      status: normalizeStatus(
        columnMap.status !== undefined ? row[columnMap.status] ?? "" : "",
      ),
    });
  }

  return result;
}

// Обратный словарь для импорта: русские/английские → код
const PRIORITY_INPUT_MAP: Record<string, TaskPriority> = {
  низкий: "low",
  low: "low",
  средний: "medium",
  medium: "medium",
  высокий: "high",
  high: "high",
};

const STATUS_INPUT_MAP: Record<string, TaskStatus> = {
  новая: "new",
  new: "new",
  "в работе": "in_progress",
  in_progress: "in_progress",
  "in progress": "in_progress",
  выполнена: "done",
  done: "done",
};

function normalizePriority(value: string): TaskPriority {
  return PRIORITY_INPUT_MAP[value.trim().toLowerCase()] ?? "medium";
}

function normalizeStatus(value: string): TaskStatus {
  return STATUS_INPUT_MAP[value.trim().toLowerCase()] ?? "new";
}
