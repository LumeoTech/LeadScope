-- ============================================================
-- V14 — Sites, Templates de E-mail por Site, Role VIEWER e Qualificação de Leads
-- ============================================================

-- 1. Inserção da Role VIEWER (caso não exista)
INSERT INTO roles (name, description)
VALUES ('VIEWER', 'Visualizador — visualiza leads e métricas com acesso somente leitura')
ON CONFLICT (name) DO NOTHING;

-- 2. Tabela de Sites Cadastrados (Landing Pages / Portais)
CREATE TABLE IF NOT EXISTS sites (
    id           BIGSERIAL    PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    url          VARCHAR(300),
    slug         VARCHAR(100) NOT NULL UNIQUE,
    webhook_url  VARCHAR(300),
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_active ON sites(active);

-- 3. Tabela de Templates de E-mail por Site
CREATE TABLE IF NOT EXISTS site_email_templates (
    id             BIGSERIAL    PRIMARY KEY,
    site_id        BIGINT       NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name           VARCHAR(150) NOT NULL,
    trigger_event  VARCHAR(50)  NOT NULL DEFAULT 'LEAD_CAPTURED', -- LEAD_CAPTURED, PROPOSAL_SENT
    subject        VARCHAR(255) NOT NULL,
    body_html      TEXT         NOT NULL,
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_templates_site ON site_email_templates(site_id);
CREATE INDEX IF NOT EXISTS idx_site_templates_event ON site_email_templates(trigger_event);

-- 4. Colunas para o Agente de Qualificação e Associação de Site na tabela Leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS site_id BIGINT REFERENCES sites(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS acceptance_chance NUMERIC(5,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cost_of_living VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS location_potential VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_rationale TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website_content_summary TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_site_id ON leads(site_id);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
