-- Создание тестовых пользователей
-- Выполните этот скрипт в Supabase SQL Editor: https://supabase.com/dashboard/project/iqnwhpmcslujgckzmwgw/sql/new

-- 1. Создаем пользователя Owner (владелец)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'owner@bazar.test',
  crypt('Owner123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Владелец Базара"}',
  FALSE,
  'authenticated',
  'authenticated',
  ''
);

-- Обновляем профиль владельца
UPDATE profiles SET role = 'owner', full_name = 'Владелец Базара' 
WHERE id = 'a1111111-1111-1111-1111-111111111111';

-- 2. Создаем пользователя Accountant (бухгалтер)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token
) VALUES (
  'b2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'accountant@bazar.test',
  crypt('Accountant123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Бухгалтер Базара"}',
  FALSE,
  'authenticated',
  'authenticated',
  ''
);

-- Обновляем профиль бухгалтера
UPDATE profiles SET role = 'accountant', full_name = 'Бухгалтер Базара' 
WHERE id = 'b2222222-2222-2222-2222-222222222222';

-- 3. Создаем пользователя Tenant (арендатор)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token
) VALUES (
  'c3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'tenant@bazar.test',
  crypt('Tenant123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Арендатор Тест"}',
  FALSE,
  'authenticated',
  'authenticated',
  ''
);

-- Обновляем профиль арендатора
UPDATE profiles SET role = 'tenant', full_name = 'Арендатор Тест' 
WHERE id = 'c3333333-3333-3333-3333-333333333333';

-- Создаем запись в таблице tenants для арендатора
INSERT INTO tenants (id, user_id, full_name, phone, email)
VALUES (
  gen_random_uuid(),
  'c3333333-3333-3333-3333-333333333333',
  'Арендатор Тест',
  '+7 700 123 4567',
  'tenant@bazar.test'
);
