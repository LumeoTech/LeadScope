-- ============================================================
-- V17 — Configurações da Busca Autônoma, Qualificação e Configurações de Usuário
-- ============================================================

-- 1. Atualiza Gabriel Castro para o email definitivo e garante papel ADMIN irrestrito
UPDATE users
SET email = 'gabrielcastro.dev01@gmail.com',
    name = 'Gabriel Castro',
    active = TRUE,
    status = 'ACTIVE',
    updated_at = NOW()
WHERE LOWER(name) LIKE '%gabriel castro%'
   OR LOWER(email) LIKE '%gabriel%castro%'
   OR LOWER(email) = 'gabriel@leadscope.com'
   OR LOWER(email) = 'gabrielcastro.dev01@gmail.com';

-- Se Gabriel Castro ainda não existir, cria o registro
INSERT INTO users (name, email, password, active, role_id, status, created_at, updated_at)
SELECT 'Gabriel Castro',
       'gabrielcastro.dev01@gmail.com',
       '$2a$12$KIXjJXvFCe9lLoGPYYnFmOWJLNEMJL6EFw3Bq4EWxA7cIGwF4qbG',
       TRUE,
       r.id,
       'ACTIVE',
       NOW(),
       NOW()
FROM roles r
WHERE r.name = 'ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM users WHERE LOWER(email) = 'gabrielcastro.dev01@gmail.com'
)
LIMIT 1;

-- Atualiza no profiles do Supabase se existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        UPDATE public.profiles
        SET email = 'gabrielcastro.dev01@gmail.com',
            role = 'admin'
        WHERE LOWER(full_name) LIKE '%gabriel castro%'
           OR LOWER(email) LIKE '%gabriel%';
    END IF;
END $$;

-- 2. Novas colunas na tabela leads para suporte a scoring preciso do Google Maps e Região
ALTER TABLE leads ADD COLUMN IF NOT EXISTS google_rating NUMERIC(3,1);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS google_reviews_count INT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS region_tier VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS digital_presence_tier VARCHAR(100);

-- 3. Tabela de Configurações da Busca Diária Autônoma (Centro de Controle)
CREATE TABLE IF NOT EXISTS auto_scan_settings (
    id                      BIGSERIAL PRIMARY KEY,
    active                  BOOLEAN NOT NULL DEFAULT TRUE,
    scheduled_time          VARCHAR(10) NOT NULL DEFAULT '06:00',
    leads_per_day           INT NOT NULL DEFAULT 10,
    min_acceptance_score    INT NOT NULL DEFAULT 70,
    location_tier           VARCHAR(50) NOT NULL DEFAULT 'ALTO',
    discarded_leads_count   INT NOT NULL DEFAULT 0,
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Garante linha singleton de configuração
INSERT INTO auto_scan_settings (id, active, scheduled_time, leads_per_day, min_acceptance_score, location_tier, discarded_leads_count, updated_at)
VALUES (1, TRUE, '06:00', 10, 70, 'ALTO', 0, NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Tabela de Configurações dos Usuários (Settings)
CREATE TABLE IF NOT EXISTS user_settings (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name                    VARCHAR(150),
    email                   VARCHAR(255),
    avatar_url              TEXT,
    theme                   VARCHAR(20) DEFAULT 'dark',
    language                VARCHAR(10) DEFAULT 'pt-BR',
    notify_new_lead         BOOLEAN DEFAULT TRUE,
    notify_new_appointment  BOOLEAN DEFAULT TRUE,
    notify_daily_summary    BOOLEAN DEFAULT TRUE,
    updated_at              TIMESTAMP DEFAULT NOW()
);
