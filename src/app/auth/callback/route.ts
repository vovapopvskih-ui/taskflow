import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Обработчик OAuth/email-редиректов от Supabase.
 * Supabase шлёт сюда пользователя после клика по ссылке в письме
 * (подтверждение email, сброс пароля).
 *
 * URL: /auth/callback?code=...&next=...
 * Supabase обменивает code на session и перенаправляет на `next`.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const nextParam = requestUrl.searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  // Стандартный PKCE-поток (с code)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Перенаправляем на вход с ошибкой
      return NextResponse.redirect(
        new URL("/login?error=auth_callback_failed", request.url),
      );
    }
    return NextResponse.redirect(new URL(nextParam, request.url));
  }

  // Поток сброса пароля (type=recovery) — перенаправляем на форму нового пароля
  if (type === "recovery" || token) {
    return NextResponse.redirect(
      new URL("/reset-password", request.url),
    );
  }

  // По умолчанию — на дашборд
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
