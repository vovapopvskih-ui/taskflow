"use client";

import { useActionState, useEffect } from "react";
import { updatePasswordAction, type ProfileState } from "@/app/(protected)/profile/actions";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState<
    ProfileState,
    FormData
  >(updatePasswordAction, {});

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      // сбрасываем форму
      const form = document.getElementById(
        "password-form",
      ) as HTMLFormElement | null;
      form?.reset();
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form id="password-form" action={formAction} className="mt-3 space-y-3">
      <PasswordField
        id="password"
        name="password"
        placeholder="Новый пароль"
        autoComplete="new-password"
        showStrength
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        placeholder="Подтвердите пароль"
        autoComplete="new-password"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Spinner size="sm" className="mr-2 text-current" />
            Сохранение...
          </>
        ) : (
          "Изменить пароль"
        )}
      </Button>
    </form>
  );
}
