-- ============================================================
-- V6 — Auditoria e Histórico de Ações
-- ============================================================

-- Log de todas as ações relevantes do sistema
CREATE TABLE audit_logs (
    id           BIGSERIAL     PRIMARY KEY,
    entity_type  VARCHAR(100)  NOT NULL,   -- ex: LEAD, COMPANY, USER, DISTRIBUTION
    entity_id    BIGINT        NOT NULL,   -- id da entidade afetada
    action       VARCHAR(50)   NOT NULL,   -- CREATE, UPDATE, DELETE, STATUS_CHANGE, ASSIGN
    performed_by BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    old_value    JSONB,                    -- snapshot do estado anterior (JSON)
    new_value    JSONB,                    -- snapshot do novo estado (JSON)
    ip_address   VARCHAR(45),             -- IPv4 ou IPv6
    user_agent   VARCHAR(512),
    description  TEXT,                    -- descrição legível da ação
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity       ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_action       ON audit_logs(action);
CREATE INDEX idx_audit_created_at   ON audit_logs(created_at);

-- ============================================================
-- V6b — Atividades/Interações dos Leads (timeline)
-- ============================================================

-- Registro de cada interação com um lead (ligação, email, reunião, etc.)
CREATE TABLE lead_activities (
    id           BIGSERIAL     PRIMARY KEY,
    lead_id      BIGINT        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id      BIGINT        NOT NULL REFERENCES users(id),
    type         VARCHAR(50)   NOT NULL,   -- LIGACAO, EMAIL, REUNIAO, WHATSAPP, NOTA, TAREFA
    title        VARCHAR(300)  NOT NULL,
    description  TEXT,
    scheduled_at TIMESTAMP,               -- quando está agendada (tarefas)
    done_at      TIMESTAMP,               -- quando foi concluída
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_activities_lead    ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_user    ON lead_activities(user_id);
CREATE INDEX idx_lead_activities_type    ON lead_activities(type);
CREATE INDEX idx_lead_activities_sched   ON lead_activities(scheduled_at);
