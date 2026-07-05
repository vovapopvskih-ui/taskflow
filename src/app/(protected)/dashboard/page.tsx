import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate, formatLastSeen } from "@/lib/format";
import { DashboardCard, DashboardStats } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User as UserIcon, Mail, Calendar, CheckSquare, Clock, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Дашборд — TaskFlow",
  description: "Ваш личный кабинет: статистика задач и аккаунт.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Берём профиль
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Считаем задачи
  const { count: totalTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: activeTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["new", "in_progress"]);

  const { count: doneTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "done");

  const displayName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "Пользователь";

  const avatarUrl = profile?.avatar_url;

  const createdAt = profile?.created_at || user.created_at;
  const lastSignIn = user.last_sign_in_at;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Приветствие */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-16 w-16 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border">
              <UserIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Привет, {displayName}!
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/tasks">
            <Button><Plus className="mr-2 h-4 w-4" />Создать задачу</Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline">Профиль</Button>
          </Link>
        </div>
      </div>

      {/* Статистика по задачам */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <DashboardStats
          icon={<CheckSquare className="h-4 w-4" />}
          label="Всего задач"
          value={totalTasks ?? 0}
        />
        <DashboardStats
          icon={<Clock className="h-4 w-4" />}
          label="Активных"
          value={activeTasks ?? 0}
        />
        <DashboardStats
          icon={<CheckSquare className="h-4 w-4" />}
          label="Выполнено"
          value={doneTasks ?? 0}
        />
      </div>

      {/* Информация об аккаунте */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <DashboardCard
          icon={<Mail className="h-4 w-4" />}
          title="Email"
          value={user.email ?? "—"}
          hint="Email нельзя изменить"
        />
        <DashboardCard
          icon={<Calendar className="h-4 w-4" />}
          title="Дата регистрации"
          value={formatDate(createdAt)}
        />
        <DashboardCard
          icon={<Clock className="h-4 w-4" />}
          title="Последний вход"
          value={lastSignIn ? formatLastSeen(lastSignIn) : "Сейчас"}
        />
        <DashboardCard
          icon={<UserIcon className="h-4 w-4" />}
          title="Имя"
          value={displayName}
          hint="Можно изменить в профиле"
        />
      </div>

      {/* Быстрые действия */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Быстрые действия
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              Все задачи
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Настройки профиля
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
