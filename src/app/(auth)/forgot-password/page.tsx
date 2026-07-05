"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useEffect, useState } from "react";
import { forgotPasswordAction, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<
    AuthState,
    FormData
  >(forgotPasswordAction, {});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setSent(true);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  if (sent) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-done/10 text-status-done">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-semibold text-card-foreground">
              Проверьте почту
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Если аккаунт с таким email существует, мы отправили ссылку для
              сброса пароля. Действительна 1 час.
            </p>
            <div className="mt-6">
              <Link href="/login">
                <Button variant="outline" className="w-full" size="lg">
                  Вернуться ко входу
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="glass rounded-2xl p-6">
          <h1 className="text-lg font-semibold text-card-foreground">
            Восстановление пароля
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Введите email, и мы отправим ссылку для сброса пароля
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

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner size="sm" className="mr-2 text-current" />
                  Отправка...
                </>
              ) : (
                "Отправить ссылку"
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
