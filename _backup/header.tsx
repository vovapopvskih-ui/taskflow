"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, ListChecks, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface HeaderProps {
  initialUser: { name: string; avatarUrl: string | null } | null;
}

export function Header({ initialUser }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Логотип — ведёт на дашборд если залогинен, иначе на главную */}
        <Link
          href={initialUser ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            TaskFlow
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {initialUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent"
              >
                {initialUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={initialUser.avatarUrl}
                    alt={initialUser.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-foreground sm:inline">
                  {initialUser.name}
                </span>
              </Link>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">
                  <ListChecks className="mr-1.5 h-4 w-4" />
                  Задачи
                </Button>
              </Link>
              <Link href="/kanban">
                <Button variant="ghost" size="sm">
                  <LayoutGrid className="mr-1.5 h-4 w-4" />
                  Канбан
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Выйти"
                title="Выйти"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Регистрация</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
