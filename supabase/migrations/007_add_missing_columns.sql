-- =====================================================
-- МИГРАЦИЯ: Добавление всех недостающих колонок
-- Цель: Синхронизация продакшн-базы с кодом приложения
-- Все команды используют IF NOT EXISTS для безопасности
-- =====================================================

-- === market_spaces ===
-- Добавить base_rent (базовая арендная плата)
ALTER TABLE market_spaces ADD COLUMN IF NOT EXISTS base_rent NUMERIC(10, 2) DEFAULT 0;

-- Добавить description (описание)
ALTER TABLE market_spaces ADD COLUMN IF NOT EXISTS description TEXT;

-- === tenants ===
-- Добавить address (адрес арендатора)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address TEXT;

-- === lease_contracts ===
-- Добавить deposit (если отсутствует)
ALTER TABLE lease_contracts ADD COLUMN IF NOT EXISTS deposit NUMERIC(10, 2) DEFAULT 0;

-- Сделать rate_per_sqm nullable (если ещё не сделано)
ALTER TABLE lease_contracts ALTER COLUMN rate_per_sqm DROP NOT NULL;

-- === payments ===
-- Добавить due_date (дата срока оплаты)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS due_date DATE;

-- Добавить paid_at (дата/время фактической оплаты)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Добавить space_id (прямая связь с местом)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES market_spaces(id) ON DELETE SET NULL;

-- Добавить period_start и period_end
ALTER TABLE payments ADD COLUMN IF NOT EXISTS period_start DATE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS period_end DATE;

-- Добавить receipt_url (ссылка на квитанцию)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Заполнить space_id из контрактов (для существующих платежей)
UPDATE payments p
SET space_id = lc.space_id
FROM lease_contracts lc
WHERE p.contract_id = lc.id AND p.space_id IS NULL;

-- Заполнить period_start/end из period_month
UPDATE payments
SET period_start = period_month,
    period_end = (period_month + INTERVAL '1 month' - INTERVAL '1 day')::DATE
WHERE period_start IS NULL AND period_month IS NOT NULL;

-- === expenses ===
-- Создать таблицу расходов (если не существует)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для expenses
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Триггер для updated_at на expenses
DROP TRIGGER IF EXISTS expenses_updated_at ON expenses;
CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS для expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage expenses" ON expenses;
CREATE POLICY "Owners can manage expenses" ON expenses
  FOR ALL USING (get_user_role() = 'owner');

DROP POLICY IF EXISTS "Accountants can view expenses" ON expenses;
CREATE POLICY "Accountants can view expenses" ON expenses
  FOR SELECT USING (get_user_role() = 'accountant');

DROP POLICY IF EXISTS "Accountants can insert expenses" ON expenses;
CREATE POLICY "Accountants can insert expenses" ON expenses
  FOR INSERT WITH CHECK (get_user_role() = 'accountant');

DROP POLICY IF EXISTS "Accountants can update expenses" ON expenses;
CREATE POLICY "Accountants can update expenses" ON expenses
  FOR UPDATE USING (get_user_role() = 'accountant');

-- =====================================================
-- МИГРАЦИЯ ЗАВЕРШЕНА!
-- =====================================================
