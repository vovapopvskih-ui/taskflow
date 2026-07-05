"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LogOut, User as UserIcon } from "lucide-react";

export function HeaderUserMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) return;

      if (user) {
        // Берём имя из метаданных auth или из profiles
        const name =
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          user.email?.split("@")[0] ||
          "Пользователь";

        setUserName(name);

        // Загружаем аватар из profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      }
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <Spinner size="sm" />;
  }

  if (!userName) {
    return (
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
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Аватар + имя (кликабельные — в профиль) */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={userName}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <UserIcon className="h-4 w-4" />
          </div>
        )}
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-foreground sm:inline">
          {userName}
        </span>
      </Link>

      <form action={logoutAction}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Выйти"
          title="Выйти"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
