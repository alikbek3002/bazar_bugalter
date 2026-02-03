-- =====================================================
-- ПОЛНАЯ МИГРАЦИЯ БАЗЫ ДАННЫХ BAZAR BUGALTER
-- Выполните этот скрипт в Supabase SQL Editor
-- https://supabase.com/dashboard/project/iqnwhpmcslujgckzmwgw/sql/new
-- =====================================================

-- ============================================
-- ЧАСТЬ 1: СОЗДАНИЕ ТИПОВ ENUM
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('owner', 'accountant', 'tenant');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'space_type') THEN
        CREATE TYPE space_type AS ENUM ('kiosk', 'pavilion', 'open_space', 'container');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'space_status') THEN
        CREATE TYPE space_status AS ENUM ('occupied', 'vacant', 'maintenance');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
        CREATE TYPE contract_status AS ENUM ('active', 'expired', 'terminated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'overdue');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('payment_reminder', 'payment_overdue', 'contract_expiring');
    END IF;
END $$;

-- ============================================
-- ЧАСТЬ 2: СОЗДАНИЕ ТАБЛИЦ
-- ============================================

-- Таблица профилей
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'tenant',
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица торговых мест
CREATE TABLE IF NOT EXISTS market_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  sector TEXT,
  row_number TEXT,
  place_number TEXT,
  area_sqm NUMERIC(10, 2),
  space_type space_type,
  business_type TEXT,
  status space_status DEFAULT 'vacant',
  base_rent NUMERIC(10, 2) DEFAULT 0,
  photos TEXT[],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица арендаторов
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  inn_idn TEXT,
  company_name TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  telegram TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица договоров аренды
CREATE TABLE IF NOT EXISTS lease_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES market_spaces(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  rate_per_sqm NUMERIC(10, 2),
  monthly_rent NUMERIC(10, 2) NOT NULL,
  deposit_amount NUMERIC(10, 2) DEFAULT 0,
  deposit NUMERIC(10, 2) DEFAULT 0,
  payment_day INTEGER CHECK (payment_day >= 1 AND payment_day <= 31),
  contract_file_url TEXT,
  status contract_status DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ограничение: одно место = один активный договор
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_contract_per_space 
ON lease_contracts(space_id) 
WHERE status = 'active';

-- Таблица платежей
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES lease_contracts(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_month DATE NOT NULL,
  charged_amount NUMERIC(10, 2) NOT NULL,
  paid_amount NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  payment_date DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  payment_method payment_method,
  status payment_status DEFAULT 'pending',
  marked_by UUID REFERENCES profiles(id),
  marked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица аудита
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  sent_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ЧАСТЬ 3: ИНДЕКСЫ
-- ============================================
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_period ON payments(period_month);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON lease_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON lease_contracts(status);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON market_spaces(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);

-- ============================================
-- ЧАСТЬ 4: ТРИГГЕРЫ
-- ============================================

-- Триггер для updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS market_spaces_updated_at ON market_spaces;
CREATE TRIGGER market_spaces_updated_at BEFORE UPDATE ON market_spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tenants_updated_at ON tenants;
CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS lease_contracts_updated_at ON lease_contracts;
CREATE TRIGGER lease_contracts_updated_at BEFORE UPDATE ON lease_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS payments_updated_at ON payments;
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Триггер для создания профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ЧАСТЬ 5: ROW LEVEL SECURITY
-- ============================================

-- Включение RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Функция для получения роли пользователя
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Owners can view all profiles" ON profiles;
CREATE POLICY "Owners can view all profiles" ON profiles
  FOR SELECT USING (get_user_role() = 'owner');

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Owners can update all profiles" ON profiles;
CREATE POLICY "Owners can update all profiles" ON profiles
  FOR ALL USING (get_user_role() = 'owner');

-- MARKET_SPACES policies
DROP POLICY IF EXISTS "Everyone can view spaces" ON market_spaces;
CREATE POLICY "Everyone can view spaces" ON market_spaces
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage spaces" ON market_spaces;
CREATE POLICY "Owners can manage spaces" ON market_spaces
  FOR ALL USING (get_user_role() = 'owner');

-- TENANTS policies
DROP POLICY IF EXISTS "Owners can manage tenants" ON tenants;
CREATE POLICY "Owners can manage tenants" ON tenants
  FOR ALL USING (get_user_role() = 'owner');

DROP POLICY IF EXISTS "Accountants can view tenants" ON tenants;
CREATE POLICY "Accountants can view tenants" ON tenants
  FOR SELECT USING (get_user_role() = 'accountant');

DROP POLICY IF EXISTS "Tenants can view own profile" ON tenants;
CREATE POLICY "Tenants can view own profile" ON tenants
  FOR SELECT USING (user_id = auth.uid());

-- LEASE_CONTRACTS policies
DROP POLICY IF EXISTS "Owners can manage contracts" ON lease_contracts;
CREATE POLICY "Owners can manage contracts" ON lease_contracts
  FOR ALL USING (get_user_role() = 'owner');

DROP POLICY IF EXISTS "Accountants can view contracts" ON lease_contracts;
CREATE POLICY "Accountants can view contracts" ON lease_contracts
  FOR SELECT USING (get_user_role() = 'accountant');

DROP POLICY IF EXISTS "Tenants can view own contracts" ON lease_contracts;
CREATE POLICY "Tenants can view own contracts" ON lease_contracts
  FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  );

-- PAYMENTS policies
DROP POLICY IF EXISTS "Owners can manage payments" ON payments;
CREATE POLICY "Owners can manage payments" ON payments
  FOR ALL USING (get_user_role() = 'owner');

DROP POLICY IF EXISTS "Accountants can view payments" ON payments;
CREATE POLICY "Accountants can view payments" ON payments
  FOR SELECT USING (get_user_role() = 'accountant');

DROP POLICY IF EXISTS "Accountants can update payments" ON payments;
CREATE POLICY "Accountants can update payments" ON payments
  FOR UPDATE USING (get_user_role() = 'accountant');

DROP POLICY IF EXISTS "Accountants can insert payments" ON payments;
CREATE POLICY "Accountants can insert payments" ON payments
  FOR INSERT WITH CHECK (get_user_role() = 'accountant');

DROP POLICY IF EXISTS "Tenants can view own payments" ON payments;
CREATE POLICY "Tenants can view own payments" ON payments
  FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  );

-- AUDIT_LOG policies
DROP POLICY IF EXISTS "Owners can view all audit logs" ON audit_log;
CREATE POLICY "Owners can view all audit logs" ON audit_log
  FOR SELECT USING (get_user_role() = 'owner');

DROP POLICY IF EXISTS "Accountants can view audit logs" ON audit_log;
CREATE POLICY "Accountants can view audit logs" ON audit_log
  FOR SELECT USING (get_user_role() = 'accountant');

DROP POLICY IF EXISTS "Users can insert own audit logs" ON audit_log;
CREATE POLICY "Users can insert own audit logs" ON audit_log
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- NOTIFICATIONS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owners can manage all notifications" ON notifications;
CREATE POLICY "Owners can manage all notifications" ON notifications
  FOR ALL USING (get_user_role() = 'owner');

-- =====================================================
-- МИГРАЦИЯ УСПЕШНО ЗАВЕРШЕНА!
-- =====================================================
