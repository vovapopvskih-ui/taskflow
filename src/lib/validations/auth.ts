import { z } from "zod";

/**
 * Правила валидации для auth-форм.
 * Один источник правды — используется и на клиенте, и в server actions.
 *
 * Требования ТЗ к паролю:
 * - минимум 8 символов
 * - минимум одна цифра
 * - минимум одна большая буква
 */

const passwordRules = z
  .string()
  .min(8, "Пароль должен содержать минимум 8 символов")
  .regex(/[0-9]/, "Пароль должен содержать минимум одну цифру")
  .regex(/[A-ZА-Я]/, "Пароль должен содержать минимум одну большую букву");

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Введите email")
    .email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Имя должно содержать минимум 2 символа")
      .max(50, "Имя не должно превышать 50 символов")
      .trim(),
    email: z
      .string()
      .min(1, "Введите email")
      .email("Некорректный email")
      .toLowerCase()
      .trim(),
    password: passwordRules,
    confirmPassword: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Введите email")
    .email("Некорректный email")
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, "Введите код подтверждения")
    .trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
