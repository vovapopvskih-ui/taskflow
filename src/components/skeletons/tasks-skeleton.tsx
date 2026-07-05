import { Skeleton } from "@/components/ui/spinner";

/**
 * Skeleton-загрузчик для списка задач.
 */
export function TasksSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="mt-2 h-3 w-48" />

      {/* Фильтры */}
      <div className="mt-6 glass rounded-2xl p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      {/* Список */}
      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-4"
          >
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-full" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
