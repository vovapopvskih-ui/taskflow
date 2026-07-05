"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useEffect } from "react";
import { loginAction, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<
    AuthState,
    FormData
  >(loginAction, {});

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="glass rounded-2xl p-6">
          <h1 className="text-lg font-semibold text-card-foreground">Вход</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Введите email и пароль для доступа к аккаунту
          </p>

          <form action={formAction} className="mt-6 space-y-4">
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-foreground"
                >
                  Пароль
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Забыли пароль?
                </Link>
              </div>
              <PasswordField
                id="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
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
                  Вход...
                </>
              ) : (
                "Войти"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
