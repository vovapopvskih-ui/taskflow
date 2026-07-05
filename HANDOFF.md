# TaskFlow — Полная документация проекта для передачи контекста

> **Цель этого файла:** дать новому ИИ-ассистенту (или разработчику) полную картину проекта —
> что сделано, как устроено, что осталось, и как продолжать без поломки.

---

## 1. О ПРОЕКТЕ

**TaskFlow** — менеджер задач с аккаунтом. Пользователь регистрируется, подтверждает email,
управляет задачами (CRUD), видит дашборд, загружает аватар, управляет профилем.

**Стек:**
- Next.js 16.2.9 (App Router, `proxy.ts` вместо `middleware.ts`)
- React 19, TypeScript 5
- Tailwind CSS 4 (без Tailwind Config — используется `@theme inline` в globals.css)
- Supabase (Auth, Postgres, Storage)
- Zod (валидация), Sonner (тосты), next-themes (тёмная тема), lucide-react (иконки)

**Supabase проект:**
- URL: `https://qjzrrhsuvbqaurlmeeai.supabase.co`
- Ключи хранятся в `.env.local` (в gitignore)

---

## 2. СТРУКТУРА ПРОЕКТА

```
C:\Users\vovap\ZCodeProject\taskflow\
├── .env.local                    # СЕКРЕТНЫЙ — ключи Supabase
├── .env.example                  # Шаблон ключей (для коммита)
├── package.json                  # Зависимости
├── tsconfig.json                 # TypeScript конфиг
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql # Все таблицы + триггеры + RLS
│   │   └── 002_storage_policies.sql # Политики Storage
│   └── run_storage_policies.txt  # Копия storage-политик
├── src/
│   ├── proxy.ts                  # ЗАМЕНА middleware.ts (Next.js 16)
│   │                              # Защита маршрутов, редиректы
│   ├── app/
│   │   ├── globals.css           # Дизайн-токены (цвета, тёмная тема)
│   │   ├── layout.tsx            # Root layout + ThemeProvider + Toaster
│   │   ├── page.tsx              # Главная страница (лендинг)
│   │   ├── (auth)/               # Публичные auth-страницы
│   │   │   ├── actions.ts        # Server Actions: register, login, logout,
│   │   │                          #   verify, resend, forgotPassword, resetPassword
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── verify/page.tsx   # Подтверждение email (обёрнут в Suspense)
│   │   ├── (protected)/          # Защищённые страницы (нужен auth)
│   │   │   ├── dashboard/page.tsx # Дашборд с данными (server component)
│   │   │   └── profile/
│   │   │       ├── page.tsx      # Страница профиля (server component)
│   │   │       ├── actions.ts    # Server Actions: updateName, updatePassword
│   │   │       └── avatar-actions.ts # Server Action: uploadAvatar, removeAvatar
│   │   └── auth/
│   │       └── callback/route.ts # Обработчик редиректов от Supabase (email, reset)
│   ├── components/
│   │   ├── header.tsx             # Хедер с логотипом, темой, user menu
│   │   ├── header-user-menu.tsx   # УСТАРЕВШИЙ — больше не используется (логика в header.tsx)
│   │   ├── theme-toggle.tsx       # Переключатель 🌞/🌙
│   │   ├── providers/
│   │   │   └── theme-provider.tsx # next-themes обёртка
│   │   ├── auth/
│   │   │   └── password-field.tsx # Поле пароля + показ/скрытие + strength meter
│   │   ├── dashboard/
│   │   │   └── dashboard-card.tsx # Компоненты DashboardCard и DashboardStats
│   │   ├── profile/
│   │   │   ├── avatar-upload.tsx  # Загрузка аватара (form + file input)
│   │   │   ├── password-form.tsx  # Форма смены пароля
│   │   │   └── profile-form.tsx   # Форма изменения имени
│   │   └── ui/
│   │       ├── button.tsx         # Кнопка (primary/secondary/outline/ghost/destructive)
│   │       ├── input.tsx          # Текстовое поле с поддержкой ошибки
│   │       ├── sonner.tsx         # Toaster (sonner, без свечений)
│   │       └── spinner.tsx        # Spinner + Skeleton loader
│   └── lib/
│       ├── utils.ts               # cn() — объединение Tailwind классов
│       ├── format.ts              # Форматирование дат на русском
│       ├── auth-redirects.ts      # Конфигурация redirect URLs для auth
│       ├── validations/
│       │   └── auth.ts            # Zod-схемы (login, register, forgot, reset, verify)
│       └── supabase/
│           ├── client.ts          # createBrowserClient() — для клиентских компонентов
│           └── server.ts          # createServerClient() — для серверных + createMiddlewareClient()
```

---

## 3. БАЗА ДАННЫХ (Supabase Postgres)

### Таблицы (созданы через `001_initial_schema.sql`):

| Таблица | Назначение | Ключевые поля |
|---|---|---|
| `auth.users` | Системная таблица Supabase Auth | email, encrypted_password, created_at, last_sign_in_at |
| `public.profiles` | Профили (1:1 с auth.users) | id (→auth.users), full_name, avatar_url, created_at, updated_at |
| `public.tasks` | Задачи | id, user_id (→auth.users), title, description, due_date, priority (low/medium/high), status (new/in_progress/done) |
| `public.comments` | Комментарии (бонус) | id, task_id, user_id, content |
| `public.attachments` | Вложения (бонус) | id, task_id, user_id, file_name, file_path, file_size, mime_type |
| `public.audit_logs` | Логирование действий | id, user_id, action, details (JSONB), ip_address |

### Триггеры:
- `on_auth_user_created` — автоматически создаёт профиль при регистрации
- `on_task_updated`, `on_profile_updated` — обновляют `updated_at`

### RLS (Row Level Security):
- Все таблицы с RLS. Пользователь видит/редактирует только свои данные.
- Исключение: `profiles` — SELECT для всех (для отображения имён других пользователей).

### Storage (корзины):
- `avatars` — Private, политики в `002_storage_policies.sql`
- `attachments` — Private, политики в `002_storage_policies.sql`

---

## 4. ПУБЛИЧНЫЕ И ЗАЩИЩЁННЫЕ МАРШРУТЫ

Настроены в `src/proxy.ts`:

**Публичные (без авторизации):**
`/`, `/login`, `/register`, `/forgot-password`, `/verify`, `/reset-password`, `/auth/callback`

**Защищённые (нужен auth):**
`/dashboard`, `/profile`, `/tasks` (пока не создан)

**Логика proxy:**
- Логотип в хедере → `/dashboard` если залогинен, `/` если нет
- Если залогинен и идёт на `/login` или `/register` → редирект на `/dashboard`
- Если НЕ залогинен и идёт на защищённый маршрут → редирект на `/login`

---

## 5. ДИЗАЙН-ТОКЕНЫ (globals.css)

**Философия:** спокойный, приглушённый, БЕЗ свечений, НЕОНА, глассморфизма.
Референсы: Linear, Vercel, Notion, Stripe.

**Акцентный цвет:** синий (не фиолетовый!)
- Светлая тема: `--primary: #2563eb`
- Тёмная тема: `--primary: #3b82f6`

**Цвета статусов задач:**
- Новая: `--status-new: #f59e0b` (жёлтый)
- В работе: `--status-progress: #3b82f6` (синий)
- Выполнена: `--status-done: #22c55e` (зелёный)

**Цвета приоритетов:**
- Низкий: `--priority-low: #6b7280` (серый)
- Средний: `--priority-medium: #f59e0b` (жёлтый)
- Высокий: `--priority-high: #ef4444` (красный)

---

## 6. ЧТО СДЕЛАНО (фазы 0–3)

### ✅ Фаза 0 — Фундамент
- Next.js 16 + TypeScript + Tailwind 4
- Supabase клиенты (browser + server + middleware)
- Root layout с ThemeProvider, Toaster, Header, Footer
- Дизайн-токены (без неона)
- UI компоненты: Button, Input, Spinner, Skeleton, Sonner Toaster
- Главная страница (лендинг с фичами)

### ✅ Фаза 1 — База данных
- Все таблицы созданы и проверены (200 OK через REST API)
- Storage корзины созданы (avatars, attachments)
- RLS политики настроены

### ✅ Фаза 2 — Аутентификация
- Zod-валидация (пароль: 8 символов + цифра + заглавная)
- Регистрация с подтверждением email (Supabase шлёт письмо со ссылкой)
- Вход (заблокирован если email не подтверждён — `Email not confirmed`)
- Выход с логированием в audit_logs
- Восстановление пароля (отправка ссылки + новый пароль)
- Подтверждение email (OTP код + автопроверка по ссылке)
- Auth callback route (`/auth/callback`)
- Toast-уведомления об ошибках/успехе

### ✅ Фаза 3 — Личный кабинет
- Дашборд: имя, email, аватар, дата регистрации, кол-во задач (всего/активных/выполнено)
- Последний вход (формат: "Сегодня в 19:35", "Вчера в 14:22")
- Редактирование имени
- Смена пароля с strength-meter
- Email — readonly (нельзя изменить)
- Загрузка аватара (JPG/PNG, до 5 МБ, кнопки «Выбрать» + «Сохранить»)
- Хедер: показывает аватар/имя/кнопку выхода когда залогинен
- Логотип ведёт на /dashboard когда залогинен

---

## 7. ЧТО ОСТАЛОСЬ (фазы 4–6)

### 🔲 Фаза 4 — CRUD задач (СЛЕДУЮЩАЯ)
Нужен новый роут `/tasks` в `src/app/(protected)/tasks/`.

**Что создать:**
- Server Actions: `createTask`, `updateTask`, `deleteTask`
- Страница `/tasks` — список задач с:
  - Создание задачи (название, описание, дата, приоритет, статус)
  - Редактирование задачи
  - Удаление с модалкой «Вы уверены?»
  - Поиск по названию
  - Фильтр по статусу и приоритету
  - Сортировка по дате, названию, приоритету
  - Пагинация (по 10 задач)
  - Skeleton-загрузчики

**Компоненты которые понадобятся:**
- `TaskList` — список задач
- `TaskCard` — карточка одной задачи
- `TaskForm` — форма создания/редактирования
- `TaskFilters` — панель фильтров/поиска/сортировки
- `ConfirmDialog` — модалка «Вы уверены?»
- `Pagination` — пагинация

### 🔲 Фаза 5 — Полировка UI/UX
- Финальная адаптивность (телефон/планшет/ПК)
- Все тосты и ошибки проверены
- Skeleton-загрузчики везде
- Плавные переходы

### 🔲 Фаза 6 — Бонусы
- Экспорт задач в PDF/CSV
- Импорт CSV → задачи
- Kanban-доска (3 колонки: Новая / В работе / Выполнена) с Drag&Drop
- Комментарии под каждой задачей (таблица `comments` уже создана)
- Прикрепление файлов к задаче (PDF, DOCX, изображения) — таблица `attachments` уже создана
- Email-уведомления о дедлайнах
- PWA (manifest + service worker)
- Docker (docker-compose)

---

## 8. КАК ЗАПУСТИТЬ

```bash
cd C:\Users\vovap\ZCodeProject\taskflow
set PATH=%PATH%;C:\Program Files\nodejs
npx next dev --port 3000
```

Браузер: **http://localhost:3000**

### Для сборки:
```bash
npx next build
```

### Важно:
- Node.js установлен в `C:\Program Files\nodejs` — нужно добавлять в PATH
- Build нужно запускать ИЗ КОРНЯ ПРОЕКТА (не из `src/`)

---

## 9. СУПАБАЙС — ЧТО НУЖНО ЗНАТЬ

### Дашборд: https://supabase.com → проект taskflow

**Что настроено:**
- Auth: Email provider включён, подтверждение email работает
- Redirect URLs: `http://localhost:3000/auth/callback`
- Site URL: `http://localhost:3000`

**Что может понадобиться:**
- Authentication → Email → Confirm email — можно выключить для разработки
- Storage → корзины `avatars` и `attachments` — созданы, Private
- SQL Editor — для миграций

---

## 10. ВАЖНЫЕ ТЕХНИЧЕСКИЕ ДЕТАЛИ

### Next.js 16 — proxy вместо middleware:
- Файл называется `src/proxy.ts` (НЕ `src/middleware.ts`)
- Функция экспортируется как `proxy()` (НЕ `middleware()`)
- Runtime: Node.js (не Edge как было в middleware)

### Tailwind CSS 4:
- Нет `tailwind.config.js` — токены задаются через `@theme inline` в `globals.css`
- Кастомные variant: `@custom-variant dark (&:is(.dark *))`
- Цвета используются через CSS-переменные: `bg-primary`, `text-muted-foreground` и т.д.

### Supabase SSR:
- Серверный клиент: `createClient()` из `@/lib/supabase/server` (асинхронный, awaited)
- Клиентский: `createClient()` из `@/lib/supabase/client` (синхронный)
- Middleware: `createMiddlewareClient()` из `@/lib/supabase/server`

### Server Actions:
- Вход/выход: `src/app/(auth)/actions.ts`
- Профиль: `src/app/(protected)/profile/actions.ts`
- Аватар: `src/app/(protected)/profile/avatar-actions.ts`
- Все используют `useActionState` на клиенте
- Ошибки Supabase переводятся на русский через `translateAuthError()`

### Формы:
- Используют нативный `<form action={serverAction}>` (не React Hook Form)
- Валидация на сервере через Zod
- PasswordField компонент — кнопка показать/скрыть + strength meter

---

## 11. ИЗВЕСТНЫЕ ПРОБЛЕМЫ / ЧТО МОЖНО УЛУЧШИТЬ

1. **`header-user-menu.tsx`** — устаревший файл, логика перенесена в `header.tsx`. Можно удалить.
2. **Аватар** — используется signed URL с истечением через 1 год. Для прода нужно пересоздавать URL периодически или сделать корзину Public.
3. **Supabase Free** — лимит на email (~2-3 в час). Для прода нужен Resend/SendGrid.
4. **IP адрес** в audit_logs — сейчас заглушка `undefined`. В реальном проде берётся из `x-forwarded-for`.
5. **Ограничение попыток входа** (5 попыток → блок 10 минут) — пока НЕ реализовано. Supabase не блокирует автоматически. Нужна своя таблица `login_attempts` + проверка в server action.

---

## 12. ЗАВИСИМОСТИ

```json
{
  "@supabase/ssr": "^0.12.0",
  "@supabase/supabase-js": "^2.108.2",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.2.1",
  "lucide-react": "^1.22.0",
  "next": "16.2.9",
  "next-themes": "^0.4.6",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "sonner": "^2.0.7",
  "tailwind-merge": "^3.6.0",
  "zod": "^4.4.3",
  "tailwindcss": "^4"
}
```

При установке новых зависимостей — запускать `npm install <package>`.
Проверять совместимость с Next.js 16 и React 19.
