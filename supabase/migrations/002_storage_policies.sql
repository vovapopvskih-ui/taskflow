-- ============================================================
-- TaskFlow — Storage Policies (выполнять ПОСЛЕ создания корзин)
-- ============================================================
-- ВНИМАНИЕ: сначала создайте корзины в дашборде:
--   Storage → New bucket → avatars (PRIVATE)
--   Storage → New bucket → attachments (PRIVATE)
-- Затем выполните этот скрипт в SQL Editor.
-- ============================================================

-- ---------- AVATARS (аватары пользователей) ----------
-- Каждый пользователь читает свой аватар (id файла = user_id)
CREATE POLICY "Avatars: read own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Пользователь может загрузить только в свою папку: avatars/<user_id>/...
CREATE POLICY "Avatars: upload own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Пользователь может обновить/удалить только свой аватар
CREATE POLICY "Avatars: update own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatars: delete own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------- ATTACHMENTS (вложения к задачам) ----------
-- Пользователь читает вложения из своей папки: attachments/<user_id>/...
CREATE POLICY "Attachments: read own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Attachments: upload own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Attachments: delete own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]
  );
