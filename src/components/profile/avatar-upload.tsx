"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  uploadAvatarAction,
  type AvatarState,
} from "@/app/(protected)/profile/avatar-actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { User as UserIcon, Upload, Trash2 } from "lucide-react";

interface AvatarUploadProps {
  currentAvatar: string | null;
  userName: string;
}

export function AvatarUpload({ currentAvatar, userName }: AvatarUploadProps) {
  const [state, formAction, isPending] = useActionState<
    AvatarState,
    FormData
  >(uploadAvatarAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatar);
  const [hasFile, setHasFile] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setHasFile(false);
      setPreview(null); // сбрасываем превью — страница перезагрузится с сервера
      // Перезагружаем страницу чтобы обновить аватар везде
      window.location.reload();
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Допускаются только JPG и PNG");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Размер файла не должен превышать 5 МБ");
        return;
      }
      setHasFile(true);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-card-foreground">Аватар</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        JPG или PNG, до 5 МБ
      </p>

      {/* Форма содержит file-input внутри — FormData автоматически передаст файл */}
      <form ref={formRef} action={formAction}>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          {preview ? (
            <img
              src={preview}
              alt={userName}
              className="h-16 w-16 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border">
              <UserIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => (formRef.current?.querySelector("input[type=file]") as HTMLInputElement | null)?.click()}
              disabled={isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {hasFile ? "Выбрать другой" : "Выбрать файл"}
            </Button>

            {hasFile && (
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2 text-current" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить аватар"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Скрытый файл-инпут внутри формы */}
        <input
          type="file"
          name="avatar"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />
      </form>
    </div>
  );
}
