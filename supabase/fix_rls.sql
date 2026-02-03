-- =====================================================
-- ДОБАВЛЕНИЕ ПОЛИТИКИ ДЛЯ ВХОДА
-- Выполните в Supabase SQL Editor
-- =====================================================

-- Разрешаем всем читать profiles для проверки логина
DROP POLICY IF EXISTS "Allow public read for login" ON profiles;
CREATE POLICY "Allow public read for login" ON profiles
  FOR SELECT USING (true);

-- Или можно полностью отключить RLS для profiles (менее безопасно, но проще)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- ГОТОВО!
-- =====================================================
