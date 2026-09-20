-- ============================================================
-- V8 — Propostas Comerciais e Conversão em Clientes
-- ============================================================

-- Adiciona campos de cliente na tabela de empresas
ALTER TABLE companies
    ADD COLUMN is_client BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN client_since TIMESTAMP;

CREATE INDEX idx_companies_is_client ON companies(is_client);

-- Propostas comerciais vinculadas a leads e empresas
CREATE TABLE proposals (
    id           BIGSERIAL      PRIMARY KEY,
    lead_id      BIGINT         NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    company_id   BIGINT         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title        VARCHAR(300)   NOT NULL,
    value        NUMERIC(15,2)  NOT NULL,
    status       VARCHAR(50)    NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
    valid_until  DATE,
    items        JSONB,                                   -- detalhamento de produtos/serviços
    notes        TEXT,
    created_by   BIGINT         NOT NULL REFERENCES users(id),
    accepted_at  TIMESTAMP,
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proposals_lead_id    ON proposals(lead_id);
CREATE INDEX idx_proposals_company_id ON proposals(company_id);
CREATE INDEX idx_proposals_status     ON proposals(status);
CREATE INDEX idx_proposals_created_by ON proposals(created_by);
