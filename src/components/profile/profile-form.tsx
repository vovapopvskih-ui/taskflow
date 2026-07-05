"use client";

import { useActionState, useEffect } from "react";
import { updateNameAction, type ProfileState } from "@/app/(protected)/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface ProfileFormProps {
  defaultName: string;
}

export function ProfileForm({ defaultName }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<
    ProfileState,
    FormData
  >(updateNameAction, {});

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="mt-3 flex gap-2">
      <Input
        name="fullName"
        type="text"
        defaultValue={defaultName}
        placeholder="Ваше имя"
        className="flex-1"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? <Spinner size="sm" className="text-current" /> : "Сохранить"}
      </Button>
    </form>
  );
}
