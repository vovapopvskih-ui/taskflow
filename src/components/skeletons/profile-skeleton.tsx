import { Skeleton } from "@/components/ui/spinner";

/**
 * Skeleton-загрузчик для страницы профиля.
 */
export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="mt-2 h-3 w-48" />

      <div className="mt-8 space-y-6">
        {/* Аватар */}
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-4 w-20" />
          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        {/* Имя */}
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>

        {/* Email */}
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>

        {/* Пароль */}
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
