-- ============================================================
-- V4 — CRM: Status, Leads e Contatos
-- ============================================================

-- Status personalizáveis do funil de vendas
CREATE TABLE lead_statuses (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,          -- ex: "Novo", "Contatado", "Proposta Enviada"
    color       VARCHAR(7)   DEFAULT '#6366F1', -- hex color para o frontend
    position    INT          NOT NULL,          -- ordem no kanban
    is_final    BOOLEAN      NOT NULL DEFAULT FALSE,  -- "Fechado Ganho" / "Fechado Perdido"
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,  -- status inicial padrão
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Leads — oportunidades de venda
CREATE TABLE leads (
    id              BIGSERIAL     PRIMARY KEY,
    company_id      BIGINT        NOT NULL REFERENCES companies(id),
    status_id       BIGINT        NOT NULL REFERENCES lead_statuses(id),
    assigned_to     BIGINT        REFERENCES users(id),      -- vendedor responsável
    title           VARCHAR(300)  NOT NULL,                   -- ex: "Venda de sistema para ACME"
    description     TEXT,
    value           NUMERIC(15,2),                            -- valor estimado R$
    expected_close  DATE,                                     -- data prevista de fechamento
    priority        VARCHAR(20)   NOT NULL DEFAULT 'MEDIA',   -- BAIXA, MEDIA, ALTA, URGENTE
    source          VARCHAR(50)   NOT NULL DEFAULT 'MANUAL',  -- MANUAL, SCANNER, INDICACAO
    created_by      BIGINT        NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Contatos vinculados a empresas/leads
CREATE TABLE contacts (
    id          BIGSERIAL     PRIMARY KEY,
    company_id  BIGINT        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    lead_id     BIGINT        REFERENCES leads(id) ON DELETE SET NULL,
    name        VARCHAR(150)  NOT NULL,
    role        VARCHAR(100),                   -- ex: "Diretor de TI", "Sócio"
    email       VARCHAR(255),
    phone       VARCHAR(30),
    whatsapp    VARCHAR(30),
    notes       TEXT,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_leads_company_id   ON leads(company_id);
CREATE INDEX idx_leads_status_id    ON leads(status_id);
CREATE INDEX idx_leads_assigned_to  ON leads(assigned_to);
CREATE INDEX idx_leads_priority     ON leads(priority);
CREATE INDEX idx_leads_created_at   ON leads(created_at);
CREATE INDEX idx_contacts_company   ON contacts(company_id);
CREATE INDEX idx_contacts_lead      ON contacts(lead_id);

-- ============================================================
-- Status padrão do funil
-- ============================================================
INSERT INTO lead_statuses (name, color, position, is_default) VALUES
    ('Novo',              '#6366F1', 1, TRUE),
    ('Contatado',         '#3B82F6', 2, FALSE),
    ('Proposta Enviada',  '#F59E0B', 3, FALSE),
    ('Negociação',        '#F97316', 4, FALSE),
    ('Fechado Ganho',     '#22C55E', 5, FALSE),
    ('Fechado Perdido',   '#EF4444', 6, FALSE);

UPDATE lead_statuses SET is_final = TRUE WHERE name IN ('Fechado Ganho', 'Fechado Perdido');
