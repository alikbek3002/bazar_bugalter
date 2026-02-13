-- =====================================================
-- МИГРАЦИЯ: Таблица расходов (expenses)
-- =====================================================

-- Создание таблицы расходов
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

-- Индексы
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Триггер для updated_at
DROP TRIGGER IF EXISTS expenses_updated_at ON expenses;
CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
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
