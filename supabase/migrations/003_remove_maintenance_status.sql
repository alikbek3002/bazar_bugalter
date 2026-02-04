-- =====================================================
-- Миграция: Удаление статуса 'maintenance' из space_status
-- =====================================================

-- Шаг 1: Обновить все места со статусом 'maintenance' на 'vacant'
UPDATE market_spaces 
SET status = 'vacant' 
WHERE status = 'maintenance';

-- Шаг 2: Удалить default значение
ALTER TABLE market_spaces ALTER COLUMN status DROP DEFAULT;

-- Шаг 3: Создать новый enum без 'maintenance'
CREATE TYPE space_status_new AS ENUM ('occupied', 'vacant');

-- Шаг 4: Изменить колонку на новый тип
ALTER TABLE market_spaces 
    ALTER COLUMN status TYPE space_status_new 
    USING status::text::space_status_new;

-- Шаг 5: Удалить старый enum и переименовать новый
DROP TYPE space_status;
ALTER TYPE space_status_new RENAME TO space_status;

-- Шаг 6: Восстановить default значение
ALTER TABLE market_spaces ALTER COLUMN status SET DEFAULT 'vacant';

-- =====================================================
-- Миграция завершена
-- =====================================================
