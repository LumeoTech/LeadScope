-- ============================================================
-- V3 — Empresas (Companies) — entidade central do Scanner
-- ============================================================
CREATE TABLE companies (
    id             BIGSERIAL     PRIMARY KEY,
    cnpj           VARCHAR(18)   UNIQUE,                        -- ex: 12.345.678/0001-99
    razao_social   VARCHAR(300)  NOT NULL,
    nome_fantasia  VARCHAR(300),
    segmento       VARCHAR(150),                                -- ex: "Tecnologia", "Varejo"
    porte          VARCHAR(50),                                 -- MEI, ME, EPP, MEDIO, GRANDE
    telefone       VARCHAR(30),
    email          VARCHAR(255),
    website        VARCHAR(255),
    -- Endereço
    cep            VARCHAR(10),
    logradouro     VARCHAR(300),
    numero         VARCHAR(20),
    complemento    VARCHAR(100),
    bairro         VARCHAR(150),
    cidade         VARCHAR(150),
    estado         CHAR(2),
    -- Controle
    source         VARCHAR(50)   NOT NULL DEFAULT 'MANUAL',     -- MANUAL, SCANNER, IMPORT
    active         BOOLEAN       NOT NULL DEFAULT TRUE,
    created_by     BIGINT        REFERENCES users(id),
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_cnpj     ON companies(cnpj);
CREATE INDEX idx_companies_cidade   ON companies(cidade);
CREATE INDEX idx_companies_estado   ON companies(estado);
CREATE INDEX idx_companies_segmento ON companies(segmento);
CREATE INDEX idx_companies_active   ON companies(active);
