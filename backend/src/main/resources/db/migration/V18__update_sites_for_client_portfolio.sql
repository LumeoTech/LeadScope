-- ============================================================
-- V18 — Sites como Portfólio de Clientes (LeadScope)
-- ============================================================

ALTER TABLE sites ADD COLUMN IF NOT EXISTS client_name VARCHAR(150);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Online';
ALTER TABLE sites ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(500);

-- Torna slug opcional/gerado automaticamente caso ainda seja restritivo
ALTER TABLE sites ALTER COLUMN slug DROP NOT NULL;
