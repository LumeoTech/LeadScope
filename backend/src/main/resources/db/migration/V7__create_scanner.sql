-- ============================================================
-- V7 — Scanner de Empresas
-- ============================================================

-- Jobs de varredura (cada vez que o scanner é executado)
CREATE TABLE scanner_jobs (
    id            BIGSERIAL     PRIMARY KEY,
    name          VARCHAR(255)  NOT NULL,                    -- nome descritivo do job
    status        VARCHAR(50)   NOT NULL DEFAULT 'PENDING',  -- PENDING, RUNNING, DONE, FAILED
    source        VARCHAR(100)  NOT NULL DEFAULT 'MANUAL',   -- MANUAL, RECEITA_FEDERAL, CNPJ_WS
    -- Filtros usados na busca
    filter_state  CHAR(2),
    filter_city   VARCHAR(150),
    filter_cnae   VARCHAR(20),                               -- código CNAE
    filter_porte  VARCHAR(50),
    -- Resultados
    total_found   INT           NOT NULL DEFAULT 0,
    total_imported INT          NOT NULL DEFAULT 0,
    total_skipped  INT          NOT NULL DEFAULT 0,
    -- Rastreabilidade
    started_by    BIGINT        NOT NULL REFERENCES users(id),
    started_at    TIMESTAMP,
    finished_at   TIMESTAMP,
    error_message TEXT,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Itens processados em cada job (cada empresa encontrada)
CREATE TABLE scanner_job_items (
    id            BIGSERIAL     PRIMARY KEY,
    job_id        BIGINT        NOT NULL REFERENCES scanner_jobs(id) ON DELETE CASCADE,
    cnpj          VARCHAR(18),
    razao_social  VARCHAR(300),
    raw_data      JSONB,                                     -- dados brutos retornados pela fonte
    status        VARCHAR(50)   NOT NULL DEFAULT 'PENDING',  -- PENDING, IMPORTED, SKIPPED, ERROR
    company_id    BIGINT        REFERENCES companies(id),    -- empresa criada (se importada)
    error_message TEXT,
    processed_at  TIMESTAMP
);

CREATE INDEX idx_scanner_jobs_status     ON scanner_jobs(status);
CREATE INDEX idx_scanner_jobs_started_by ON scanner_jobs(started_by);
CREATE INDEX idx_scanner_items_job       ON scanner_job_items(job_id);
CREATE INDEX idx_scanner_items_status    ON scanner_job_items(status);
CREATE INDEX idx_scanner_items_cnpj      ON scanner_job_items(cnpj);
