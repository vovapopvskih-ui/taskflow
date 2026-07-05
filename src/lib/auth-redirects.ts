/**
 * Конфигурация redirect-URL для auth-потоков.
 *
 * Supabase использует их для формирования ссылок в письмах
 * (подтверждение email, сброс пароля).
 */
export const AUTH_REDIRECTS = {
  /** Куда вести после подтверждения email */
  emailConfirm: "/login",
  /** Куда вести после клика по ссылке сброса пароля */
  passwordReset: "/reset-password",
  /** Куда вести после успешного входа */
  afterLogin: "/dashboard",
  /** Куда вести после выхода */
  afterLogout: "/login",
} as const;

/**
 * Определяет базовый URL приложения в зависимости от окружения.
 * Используется для формирования redirect-ссылок в письмах Supabase.
 */
export function getSiteURL(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
