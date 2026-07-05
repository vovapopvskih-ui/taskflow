"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { registerAction, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    AuthState,
    FormData
  >(registerAction, {});

  // Показываем success-сообщение и редирект на verify
  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      const email = new FormData(
        document.querySelector("form") as HTMLFormElement,
      ).get("email");
      router.push(`/verify?email=${encodeURIComponent(String(email))}`);
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="glass rounded-2xl p-6">
          <h1 className="text-lg font-semibold text-card-foreground">
            Регистрация
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Создайте аккаунт для управления задачами
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="text-xs font-medium text-foreground"
              >
                Имя
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Иван Иванов"
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ivan@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-foreground"
              >
                Пароль
              </label>
              <PasswordField
                id="password"
                name="password"
                placeholder="••••••••"
                autoComplete="new-password"
                showStrength
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-medium text-foreground"
              >
                Подтверждение пароля
              </label>
              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner size="sm" className="mr-2 text-current" />
                  Создание аккаунта...
                </>
              ) : (
                "Создать аккаунт"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
