# CRM + Scanner — Sistema Comercial

Plataforma de CRM integrada a um Scanner de empresas.
Backend em Java 21 + Spring Boot. Frontend em React + TypeScript + Vite.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Java 21, Spring Boot 4.x, Maven |
| Banco | PostgreSQL 16 + Flyway |
| Segurança | Spring Security + JWT |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Infra local | Docker Compose |
| Docs API | Swagger / OpenAPI |

---

## Pré-requisitos

- Java 21 LTS (Temurin recomendado): https://adoptium.net/
- Node.js LTS: https://nodejs.org/
- Docker Desktop: https://www.docker.com/products/docker-desktop/

---

## Como rodar localmente

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env se necessário (os valores padrão funcionam em dev)
```

### 2. Subir o banco de dados

```bash
docker compose up -d
```

O PostgreSQL estará disponível em `localhost:5432`.
O pgAdmin (interface visual) estará em `http://localhost:5050`.

### 3. Iniciar o backend

```bash
cd backend
./mvnw spring-boot:run
```

A API estará em: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html
Health check: http://localhost:8080/api/health

### 4. Iniciar o frontend (Fase 9)

```bash
cd frontend
npm install
npm run dev
```

---

## Estrutura do projeto

```
meu-backend/
├── backend/                  ← Spring Boot (Java 21)
│   ├── src/main/java/com/crmscanner/
│   │   ├── auth/             ← autenticação e JWT
│   │   ├── crm/              ← leads, empresas, status
│   │   ├── scanner/          ← scanner de empresas
│   │   ├── distribution/     ← distribuição de leads
│   │   ├── audit/            ← auditoria e histórico
│   │   ├── config/           ← configurações Spring
│   │   ├── exception/        ← tratamento de erros
│   │   └── common/           ← utilitários compartilhados
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/     ← scripts Flyway (V1__, V2__...)
├── frontend/                 ← React + TypeScript + Vite (Fase 9)
├── docker-compose.yml        ← PostgreSQL + pgAdmin
├── .env.example              ← modelo de variáveis de ambiente
└── README.md
```

---

## Fases de desenvolvimento

- [x] **Fase 0** — Diagnóstico e organização
- [x] **Fase 1** — Fundação do backend (Spring Boot + estrutura)
- [x] **Fase 2** — Banco de dados e migrações Flyway
- [x] **Fase 3** — Autenticação JWT e usuários
- [x] **Fase 4** — Permissões e auditoria
- [x] **Fase 5** — CRM: leads, empresas, status
- [x] **Fase 6** — Distribuição gradual de leads
- [x] **Fase 7** — Scanner de empresas
- [x] **Fase 8** — Reuniões, propostas, clientes
- [x] **Fase 9** — Frontend React
- [x] **Fase 10** — Testes, segurança e deploy

---

## Como executar os testes

```bash
cd backend
./mvnw test
```

---

## Deploy Completo com Docker Compose

Para subir toda a aplicação (PostgreSQL, Backend Spring Boot, Frontend React e pgAdmin):

```bash
docker compose up --build -d
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **pgAdmin:** http://localhost:5050 (login: `admin@crm.local` / `admin123`)
