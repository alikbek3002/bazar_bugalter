-- =====================================================
-- ДОБАВЛЕНИЕ КОЛОНКИ PASSWORD В PROFILES
-- И СОЗДАНИЕ ПОЛЬЗОВАТЕЛЕЙ
-- Выполните в Supabase SQL Editor
-- =====================================================

-- Добавляем колонку password если её нет
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- Создаём/обновляем пользователей с паролями
INSERT INTO profiles (id, role, full_name, email, password) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'owner', 'Владелец Базара', 'owner@bazar.kg', 'owner')
ON CONFLICT (id) DO UPDATE SET
  role = 'owner',
  full_name = 'Владелец Базара',
  email = 'owner@bazar.kg',
  password = 'owner';

INSERT INTO profiles (id, role, full_name, email, password) VALUES  
  ('b2222222-2222-2222-2222-222222222222', 'accountant', 'Бухгалтер Базара', 'accountant@bazar.kg', 'accountant')
ON CONFLICT (id) DO UPDATE SET
  role = 'accountant',
  full_name = 'Бухгалтер Базара',
  email = 'accountant@bazar.kg',
  password = 'accountant';

-- =====================================================
-- ГОТОВО! Данные для входа:
-- 
-- 👑 ВЛАДЕЛЕЦ:
--    Email: owner@bazar.kg
--    Пароль: owner
--
-- 📊 БУХГАЛТЕР:
--    Email: accountant@bazar.kg
--    Пароль: accountant
-- =====================================================
