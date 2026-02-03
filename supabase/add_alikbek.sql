-- ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ mukanbetovalibek7@gmail.com
INSERT INTO profiles (id, role, full_name, email, password) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'owner', 'Аликбек Муканбетов', 'mukanbetovalibek7@gmail.com', '123456')
ON CONFLICT (id) DO UPDATE SET
  role = 'owner',
  full_name = 'Аликбек Муканбетов',
  email = 'mukanbetovalibek7@gmail.com',
  password = 'EXCLUDED.password'; -- Обновить пароль если нужно
