-- ============================================================
-- V5 — Distribuição de Leads
-- ============================================================

-- Regras de distribuição: como leads são atribuídos a vendedores
CREATE TABLE distribution_rules (
    id              BIGSERIAL     PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    strategy        VARCHAR(50)   NOT NULL DEFAULT 'ROUND_ROBIN', -- ROUND_ROBIN, MANUAL, SEGMENTO, REGIAO
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    priority        INT           NOT NULL DEFAULT 0,
    -- Filtros opcionais (aplicáveis dependendo da strategy)
    filter_state    CHAR(2),          -- filtrar por estado (UF)
    filter_segment  VARCHAR(150),     -- filtrar por segmento de empresa
    created_by      BIGINT        NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Membros de cada regra de distribuição (quais vendedores participam)
CREATE TABLE distribution_rule_members (
    id          BIGSERIAL  PRIMARY KEY,
    rule_id     BIGINT     NOT NULL REFERENCES distribution_rules(id) ON DELETE CASCADE,
    user_id     BIGINT     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight      INT        NOT NULL DEFAULT 1,  -- peso para distribuição ponderada
    active      BOOLEAN    NOT NULL DEFAULT TRUE,
    UNIQUE (rule_id, user_id)
);

-- Histórico de cada distribuição realizada
CREATE TABLE lead_distributions (
    id          BIGSERIAL  PRIMARY KEY,
    lead_id     BIGINT     NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    rule_id     BIGINT     REFERENCES distribution_rules(id) ON DELETE SET NULL,
    assigned_to BIGINT     NOT NULL REFERENCES users(id),
    assigned_by BIGINT     REFERENCES users(id),          -- NULL = automático
    notes       TEXT,
    distributed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dist_rule_members_rule ON distribution_rule_members(rule_id);
CREATE INDEX idx_dist_rule_members_user ON distribution_rule_members(user_id);
CREATE INDEX idx_lead_distributions_lead ON lead_distributions(lead_id);
CREATE INDEX idx_lead_distributions_user ON lead_distributions(assigned_to);
