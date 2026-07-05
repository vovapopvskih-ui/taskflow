-- ============================================================
-- TaskFlow — Initial Schema Migration
-- ============================================================
-- Таблицы: profiles, tasks, comments, attachments, audit_logs
-- Supabase Auth уже создаёт таблицу auth.users автоматически
-- ============================================================

-- 1. ПРОФИЛИ (расширяют auth.users)
-- Связь 1:1 с auth.users через user_id
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индекс для быстрого поиска по email (через auth.users)
CREATE INDEX idx_profiles_id ON public.profiles(id);

-- 2. ЗАДАЧИ
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(user_id, status);
CREATE INDEX idx_tasks_priority ON public.tasks(user_id, priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(user_id, due_date);

-- 3. КОММЕНТАРИИ (бонус)
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  content TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_task_id ON public.comments(task_id);

-- 4. ВЛОЖЕНИЯ К ЗАДАЧАМ (бонус)
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- путь в Supabase Storage
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_task_id ON public.attachments(task_id);

-- 5. АУДИТ-ЛОГИ (логирование действий)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  action TEXT NOT NULL, -- login, logout, password_change, task_create, etc.
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 6. TRIGGERS — автоматическое создание профиля при регистрации
-- И обновление updated_at

-- Автосоздание профиля при новом пользователе
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Автообновление updated_at для задач
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_task_updated
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 7. RLS — Row Level Security
-- Каждый пользователь видит только свои данные
-- ============================================================

-- Включаем RLS для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES: пользователь может читать все профили, но редактировать только свой
CREATE POLICY "Profiles: select all" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Profiles: update own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles: insert own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- TASKS: только свои задачи
CREATE POLICY "Tasks: select own" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Tasks: insert own" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tasks: update own" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Tasks: delete own" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS: пользователь видит комментарии своих задач
CREATE POLICY "Comments: select own tasks" ON public.comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = comments.task_id AND tasks.user_id = auth.uid())
  );

CREATE POLICY "Comments: insert own" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comments: delete own" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- ATTACHMENTS: те же правила, что для комментариев
CREATE POLICY "Attachments: select own tasks" ON public.attachments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = attachments.task_id AND tasks.user_id = auth.uid())
  );

CREATE POLICY "Attachments: insert own" ON public.attachments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Attachments: delete own" ON public.attachments
  FOR DELETE USING (auth.uid() = user_id);

-- AUDIT_LOGS: каждый видит только свои логи
CREATE POLICY "Audit: select own" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Audit: insert own" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
