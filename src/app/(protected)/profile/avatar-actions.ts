"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AvatarState = { error?: string; success?: string };

const MAX_SIZE = 5 * 1024 * 1024; // 5 МБ
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

// ============================================================
// ЗАГРУЗКА АВАТАРА
// ============================================================
export async function uploadAvatarAction(
  _prev: AvatarState,
  formData: FormData,
): Promise<AvatarState> {
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "Выберите файл" };
  }

  // Проверка типа
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Допускаются только JPG и PNG" };
  }

  // Проверка размера
  if (file.size > MAX_SIZE) {
    return { error: "Размер файла не должен превышать 5 МБ" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  // Расширение файла
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${user.id}/avatar.${ext}`;

  // Загружаем в Storage (перезаписываем если уже есть)
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return { error: "Ошибка загрузки файла" };
  }

  // Получаем публичный URL — но корзина приватная, нужен signed URL
  const { data: urlData } = await supabase.storage
    .from("avatars")
    .createSignedUrl(filePath, 365 * 24 * 3600); // 1 год

  const signedUrl = urlData?.signedUrl;

  if (!signedUrl) {
    return { error: "Не удалось получить URL аватара" };
  }

  // Сохраняем путь в профиле
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: signedUrl })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Ошибка сохранения аватара" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: "Аватар обновлён" };
}

// ============================================================
// УДАЛЕНИЕ АВАТАРА
// ============================================================
export async function removeAvatarAction(): Promise<AvatarState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  // Узнаём текущий путь файла
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.avatar_url) {
    // Удаляем файл из storage (пробуем оба расширения)
    for (const ext of ["jpg", "png"]) {
      await supabase.storage
        .from("avatars")
        .remove([`${user.id}/avatar.${ext}`]);
    }

    await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: "Аватар удалён" };
}
