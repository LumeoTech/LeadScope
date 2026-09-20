-- ============================================================
-- V1 — Roles e Usuários
-- ============================================================
-- Tabela de perfis/roles do sistema
CREATE TABLE roles (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,  -- ex: ADMIN, VENDEDOR, GERENTE
    description VARCHAR(255),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Tabela de usuários do sistema
CREATE TABLE users (
    id           BIGSERIAL     PRIMARY KEY,
    name         VARCHAR(150)  NOT NULL,
    email        VARCHAR(255)  NOT NULL UNIQUE,
    password     VARCHAR(255)  NOT NULL,          -- bcrypt hash
    active       BOOLEAN       NOT NULL DEFAULT TRUE,
    role_id      BIGINT        NOT NULL REFERENCES roles(id),
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Índices de busca frequente
CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_active ON users(active);

-- ============================================================
-- Dados iniciais obrigatórios
-- ============================================================
INSERT INTO roles (name, description) VALUES
    ('ADMIN',    'Administrador do sistema — acesso total'),
    ('GERENTE',  'Gerente de vendas — visualiza tudo, distribui leads'),
    ('VENDEDOR', 'Vendedor — acessa apenas seus próprios leads');

-- Usuário admin padrão (senha: Admin@123 — TROQUE EM PRODUÇÃO)
-- Hash BCrypt rounds=12 de "Admin@123"
INSERT INTO users (name, email, password, role_id) VALUES (
    'Administrador',
    'admin@crmscanner.com',
    '$2a$12$KIXjJXvFCe9lLoGPYYnFmOWJLNEMJL6EFw3Bq4EWxA7cIGwF4qbG',
    (SELECT id FROM roles WHERE name = 'ADMIN')
);
