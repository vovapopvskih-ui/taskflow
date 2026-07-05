"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/lib/validations/auth";
import { AUTH_REDIRECTS, getSiteURL } from "@/lib/auth-redirects";

/**
 * Нормализованное сообщение об ошибке Supabase на русский язык.
 * Карта типовых ошибок auth.
 */
function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials":
      "Неверный email или пароль",
    "Email not confirmed":
      "Email не подтверждён. Проверьте почту и подтвердите email.",
    "User already registered":
      "Пользователь с таким email уже зарегистрирован",
    "Password should be at least 6 characters":
      "Пароль должен содержать минимум 6 символов",
    "Email rate limit exceeded":
      "Слишком много писем. Подождите немного и попробуйте снова.",
    "For security purposes, you can only request this after 60 seconds.":
      "Ради безопасности, запрос можно повторить через 60 секунд.",
  };

  for (const key of Object.keys(map)) {
    if (message.includes(key)) return map[key];
  }
  return message;
}

function getClientIP(): string | undefined {
  // заглушка — IP берётся из заголовков
  return undefined;
}

/**
 * Логирование действия пользователя в audit_logs.
 */
async function logAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string | null,
  action: string,
  details: Record<string, unknown> = {},
) {
  try {
    const ip = getClientIP();
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      details,
      ip_address: ip,
    });
  } catch {
    // логирование не должно валить основной поток
  }
}

export type AuthState = {
  error?: string;
  success?: string;
};

// ============================================================
// РЕГИСТРАЦИЯ
// ============================================================
export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { fullName, email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getSiteURL()}${AUTH_REDIRECTS.emailConfirm}`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // Если сессия уже установлена — значит email не требует подтверждения
  if (data.session) {
    await logAction(supabase, data.user?.id ?? null, "register", { email });
    redirect(AUTH_REDIRECTS.afterLogin);
  }

  // email требует подтверждения → ведём на страницу ввода кода
  return {
    success:
      "Аккаунт создан. Мы отправили код подтверждения на ваш email. Введите его для активации.",
  };
}

// ============================================================
// ПОДТВЕРЖДЕНИЕ EMAIL (по коду или ссылке)
// ============================================================
export async function verifyEmailAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = { token: String(formData.get("token") ?? "") };
  const parsed = verifyEmailSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: String(formData.get("email") ?? ""),
    token: parsed.data.token,
    type: "email",
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return { success: "Email подтверждён! Теперь можно войти." };
}

export async function resendVerificationAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${getSiteURL()}${AUTH_REDIRECTS.emailConfirm}`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return { success: "Письмо отправлено повторно." };
}

// ============================================================
// ВХОД
// ============================================================
export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  await logAction(supabase, data.user.id, "login", { email });
  redirect(AUTH_REDIRECTS.afterLogin);
}

// ============================================================
// ВЫХОД
// ============================================================
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await logAction(supabase, user.id, "logout");
  }
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(AUTH_REDIRECTS.afterLogout);
}

// ============================================================
// ВОССТАНОВЛЕНИЕ ПАРОЛЯ — отправка письма
// ============================================================
export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = { email: String(formData.get("email") ?? "") };
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    `${getSiteURL()}${AUTH_REDIRECTS.passwordReset}`,
    { redirectTo: `${getSiteURL()}${AUTH_REDIRECTS.passwordReset}` },
  );

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // В целях безопасности всегда показываем успех, даже если email не существует
  return {
    success:
      "Если аккаунт с таким email существует, ссылка для сброса пароля отправлена.",
  };
}

// ============================================================
// ВОССТАНОВЛЕНИЕ ПАРОЛЯ — установка нового пароля
// (вызывается после клика по ссылке из письма)
// ============================================================
export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await logAction(supabase, user.id, "password_change", {
      via: "reset",
    });
  }

  return {
    success:
      "Пароль успешно изменён. Теперь вы можете войти с новым паролем.",
  };
}
