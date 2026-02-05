-- Миграция: добавление space_id и периода в payments
-- Дата: 2026-02-05

-- Добавить space_id для прямой связи с местом
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES market_spaces(id) ON DELETE SET NULL;

-- Добавить период оплаты (с какой даты по какую)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS period_start DATE;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS period_end DATE;

-- Заполнить space_id из существующих контрактов
UPDATE payments p
SET space_id = lc.space_id
FROM lease_contracts lc
WHERE p.contract_id = lc.id AND p.space_id IS NULL;

-- Заполнить period_start/end из period_month (для совместимости)
UPDATE payments
SET period_start = period_month,
    period_end = (period_month + INTERVAL '1 month' - INTERVAL '1 day')::DATE
WHERE period_start IS NULL;
