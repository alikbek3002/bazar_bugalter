-- Row Level Security Policies

-- Включение RLS для всех таблиц
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

-- ============================================
-- PROFILES policies
-- ============================================
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Owners can view all profiles" ON profiles
  FOR SELECT USING (get_user_role() = 'owner');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Owners can update all profiles" ON profiles
  FOR ALL USING (get_user_role() = 'owner');

-- ============================================
-- MARKET_SPACES policies
-- ============================================
CREATE POLICY "Everyone can view spaces" ON market_spaces
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage spaces" ON market_spaces
  FOR ALL USING (get_user_role() = 'owner');

-- ============================================
-- TENANTS policies
-- ============================================
CREATE POLICY "Owners can manage tenants" ON tenants
  FOR ALL USING (get_user_role() = 'owner');

CREATE POLICY "Accountants can view tenants" ON tenants
  FOR SELECT USING (get_user_role() = 'accountant');

CREATE POLICY "Tenants can view own profile" ON tenants
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- LEASE_CONTRACTS policies
-- ============================================
CREATE POLICY "Owners can manage contracts" ON lease_contracts
  FOR ALL USING (get_user_role() = 'owner');

CREATE POLICY "Accountants can view contracts" ON lease_contracts
  FOR SELECT USING (get_user_role() = 'accountant');

CREATE POLICY "Tenants can view own contracts" ON lease_contracts
  FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  );

-- ============================================
-- PAYMENTS policies
-- ============================================
CREATE POLICY "Owners can manage payments" ON payments
  FOR ALL USING (get_user_role() = 'owner');

CREATE POLICY "Accountants can view and update payments" ON payments
  FOR SELECT USING (get_user_role() = 'accountant');

CREATE POLICY "Accountants can update payments" ON payments
  FOR UPDATE USING (get_user_role() = 'accountant');

CREATE POLICY "Accountants can insert payments" ON payments
  FOR INSERT WITH CHECK (get_user_role() = 'accountant');

CREATE POLICY "Tenants can view own payments" ON payments
  FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  );

-- ============================================
-- AUDIT_LOG policies
-- ============================================
CREATE POLICY "Owners can view all audit logs" ON audit_log
  FOR SELECT USING (get_user_role() = 'owner');

CREATE POLICY "Accountants can view and insert audit logs" ON audit_log
  FOR SELECT USING (get_user_role() = 'accountant');

CREATE POLICY "Accountants can insert audit logs" ON audit_log
  FOR INSERT WITH CHECK (get_user_role() IN ('owner', 'accountant'));

CREATE POLICY "Users can insert own audit logs" ON audit_log
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- NOTIFICATIONS policies
-- ============================================
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (get_user_role() IN ('owner', 'accountant'));

CREATE POLICY "Owners can manage all notifications" ON notifications
  FOR ALL USING (get_user_role() = 'owner');
