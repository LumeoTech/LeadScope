-- V12: Acordos comerciais, anotações de leads, código único de lead e aprovação de usuários

-- 1. Status de aprovação de usuários (PENDING, ACTIVE, REJECTED)
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';

-- 2. Código único do lead (LEAD-2026-XXXX)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS code VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_code ON leads(code);

-- Preencher leads existentes com códigos retroativos
UPDATE leads 
SET code = 'LEAD-2026-' || LPAD(id::text, 4, '0') 
WHERE code IS NULL;

-- 3. Tabela de Acordos Comerciais com Aceite Digital
CREATE TABLE IF NOT EXISTS agreements (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    term_content TEXT NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED
    accepted_by_name VARCHAR(255),
    accepted_at TIMESTAMP,
    ip_address VARCHAR(100),
    user_agent TEXT,
    content_sha256 VARCHAR(64),
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agreements_token ON agreements(token);
CREATE INDEX IF NOT EXISTS idx_agreements_company_id ON agreements(company_id);
CREATE INDEX IF NOT EXISTS idx_agreements_lead_id ON agreements(lead_id);

-- 4. Tabela de Anotações e Histórico de Conversas do Lead
CREATE TABLE IF NOT EXISTS lead_notes (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    is_status_change BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
