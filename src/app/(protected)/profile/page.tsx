import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { AvatarUpload } from "@/components/profile/avatar-upload";

export const metadata: Metadata = {
  title: "Профиль — TaskFlow",
  description: "Управление аккаунтом: имя, аватар, пароль.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const fullName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string) ||
    "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-foreground">Профиль</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Управление аккаунтом и настройками
      </p>

      <div className="mt-8 space-y-6">
        <AvatarUpload
          currentAvatar={profile?.avatar_url ?? null}
          userName={fullName || user.email || "Пользователь"}
        />

        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-card-foreground">
            Имя
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Как к вам обращаться
          </p>
          <ProfileForm defaultName={fullName} />
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-card-foreground">
            Email
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Email нельзя изменить
          </p>
          <div className="mt-3 flex h-9 items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
            {user.email}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-card-foreground">
            Смена пароля
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Введите новый пароль
          </p>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
