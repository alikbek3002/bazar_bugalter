-- Создание типов ENUM
CREATE TYPE user_role AS ENUM ('owner', 'accountant', 'tenant');
CREATE TYPE space_type AS ENUM ('kiosk', 'pavilion', 'open_space', 'container');
CREATE TYPE space_status AS ENUM ('occupied', 'vacant', 'maintenance');
CREATE TYPE contract_status AS ENUM ('active', 'expired', 'terminated');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'overdue');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card');
CREATE TYPE notification_type AS ENUM ('payment_reminder', 'payment_overdue', 'contract_expiring');

-- Таблица профилей (расширение Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'tenant',
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица торговых мест
CREATE TABLE market_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  sector TEXT,
  row_number TEXT,
  place_number TEXT,
  area_sqm NUMERIC(10, 2),
  space_type space_type,
  business_type TEXT,
  status space_status DEFAULT 'vacant',
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица арендаторов
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  inn_idn TEXT,
  company_name TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  telegram TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица договоров аренды
CREATE TABLE lease_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES market_spaces(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  rate_per_sqm NUMERIC(10, 2) NOT NULL,
  monthly_rent NUMERIC(10, 2) NOT NULL,
  deposit_amount NUMERIC(10, 2),
  payment_day INTEGER CHECK (payment_day >= 1 AND payment_day <= 31),
  contract_file_url TEXT,
  status contract_status DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ограничение: одно место = один активный договор
CREATE UNIQUE INDEX unique_active_contract_per_space 
ON lease_contracts(space_id) 
WHERE status = 'active';

-- Таблица платежей
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES lease_contracts(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_month DATE NOT NULL,
  charged_amount NUMERIC(10, 2) NOT NULL,
  paid_amount NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  payment_date DATE,
  payment_method payment_method,
  status payment_status DEFAULT 'pending',
  marked_by UUID REFERENCES profiles(id),
  marked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица аудита
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица уведомлений
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  sent_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_period ON payments(period_month);
CREATE INDEX idx_contracts_tenant ON lease_contracts(tenant_id);
CREATE INDEX idx_contracts_status ON lease_contracts(status);
CREATE INDEX idx_spaces_status ON market_spaces(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);

-- Триггер для updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER market_spaces_updated_at BEFORE UPDATE ON market_spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lease_contracts_updated_at BEFORE UPDATE ON lease_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Триггер для создания профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
