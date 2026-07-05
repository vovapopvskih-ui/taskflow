"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetPasswordAction, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    AuthState,
    FormData
  >(resetPasswordAction, {});

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      router.push("/login");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="glass rounded-2xl p-6">
          <h1 className="text-lg font-semibold text-card-foreground">
            Новый пароль
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Придумайте новый пароль для вашего аккаунта
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-foreground"
              >
                Новый пароль
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
                  Сохранение...
                </>
              ) : (
                "Сохранить пароль"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Вернуться ко входу
          </Link>
        </p>
      </div>
    </div>
  );
}
