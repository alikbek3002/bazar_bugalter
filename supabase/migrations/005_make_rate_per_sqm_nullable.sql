-- Убираем ограничение NOT NULL с rate_per_sqm, так как это поле больше не используется в форме
ALTER TABLE lease_contracts ALTER COLUMN rate_per_sqm DROP NOT NULL;
