-- ============================================================
-- V9 — Ajuste de CHAR(2) para VARCHAR(2) para compatibilidade Hibernate
-- ============================================================
ALTER TABLE companies ALTER COLUMN estado TYPE VARCHAR(2);
ALTER TABLE distribution_rules ALTER COLUMN filter_state TYPE VARCHAR(2);
ALTER TABLE scanner_jobs ALTER COLUMN filter_state TYPE VARCHAR(2);
