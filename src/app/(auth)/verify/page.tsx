"use client";

import { useActionState } from "react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  verifyEmailAction,
  resendVerificationAction,
  type AuthState,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <Spinner size="lg" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailFromQuery);
  const [verified, setVerified] = useState(false);

  const [verifyState, verifyAction, verifyPending] = useActionState<
    AuthState,
    FormData
  >(verifyEmailAction, {});

  const [resendState, resendAction, resendPending] = useActionState<
    AuthState,
    FormData
  >(resendVerificationAction, {});

  // Подтверждение кода
  useEffect(() => {
    if (verifyState?.success) {
      toast.success(verifyState.success);
      setVerified(true);
    } else if (verifyState?.error) {
      toast.error(verifyState.error);
    }
  }, [verifyState]);

  // Повторная отправка письма
  useEffect(() => {
    if (resendState?.success) {
      toast.success(resendState.success);
    } else if (resendState?.error) {
      toast.error(resendState.error);
    }
  }, [resendState]);

  // Если в URL есть token из письма — подставляем и отправляем автоматически
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      const fd = new FormData();
      fd.set("token", tokenFromUrl);
      fd.set("email", emailFromQuery);
      verifyAction(fd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (verified) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-done/10 text-status-done">
              <MailCheck className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-semibold text-card-foreground">
              Email подтверждён!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Теперь вы можете войти в аккаунт.
            </p>
            <div className="mt-6">
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push("/login")}
              >
                Войти
              </Button>
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
            Подтверждение email
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Мы отправили код подтверждения на ваш email. Введите его ниже.
          </p>

          <form action={verifyAction} className="mt-6 space-y-4">
            <input type="hidden" name="email" value={email} />

            <div className="space-y-1.5">
              <label
                htmlFor="token"
                className="text-xs font-medium text-foreground"
              >
                Код подтверждения
              </label>
              <Input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                className="text-center text-lg tracking-[0.5em]"
                maxLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={verifyPending}
            >
              {verifyPending ? (
                <>
                  <Spinner size="sm" className="mr-2 text-current" />
                  Проверка...
                </>
              ) : (
                "Подтвердить"
              )}
            </Button>
          </form>

          {/* Повторная отправка письма */}
          <form action={resendAction} className="mt-4">
            <input type="hidden" name="email" value={email} />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full"
              disabled={resendPending}
            >
              {resendPending ? (
                <>
                  <Spinner size="sm" className="mr-2 text-current" />
                  Отправка...
                </>
              ) : (
                "Отправить код повторно"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
