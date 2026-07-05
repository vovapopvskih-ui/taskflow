"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { z } from "zod";

export type ProfileState = { error?: string; success?: string };

const updateNameSchema = z.object({
  fullName: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя не должно превышать 50 символов")
    .trim(),
});

// ============================================================
// ОБНОВЛЕНИЕ ИМЕНИ
// ============================================================
export async function updateNameAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = updateNameSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  // Обновляем имя в profiles и в user_metadata auth
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Ошибка обновления профиля" };
  }

  const { error: metaError } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });

  if (metaError) {
    return { error: "Ошибка обновления данных" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: "Имя обновлено" };
}

// ============================================================
// ОБНОВЛЕНИЕ ПАРОЛЯ
// ============================================================
export async function updatePasswordAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const raw = {
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Ошибка смены пароля" };
  }

  // Логируем смену пароля
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "password_change",
    details: { via: "profile" },
  });

  return { success: "Пароль изменён" };
}
