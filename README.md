# 🎯 LeadScope CRM & Scanner

Sistema corporativo de prospecção, qualificação de leads por IA, gestão de pipeline de vendas (Kanban e Tabela), propostas comerciais com assinatura e aceite digital, e radar geográfico de oportunidades.

---

## 🚀 Arquitetura & Tecnologias

### **Backend**
- **Java 21 & Spring Boot 3**
- **Spring Security & JWT (HMAC-SHA256)** com rotação e expiração configuráveis
- **Spring Data JPA & Hibernate**
- **Flyway Migrations** para controle de versão e consistência de schema
- **PostgreSQL** com suporte a Supabase Pooler (Transaction Mode na porta 6543) e HikariCP
- **Integração Google Places API & OpenStreetMap / Nominatim**
- **SpringDoc OpenAPI / Swagger UI** (`/swagger-ui.html`)
- **Docker & Docker Compose**

### **Frontend**
- **React 19 & TypeScript**
- **Vite 8**
- **Leaflet & OpenStreetMap** (Radar geográfico interativo de prospecção)
- **Lucide Icons**
- **Suporte nativo a Dark Mode / Light Mode**
- **Design System refinado (Glassmorphism, Micro-interações, Responsivo)**

---

## 📂 Estrutura do Projeto

```text
├── backend/                  # API REST em Spring Boot 3
│   ├── src/main/java/        # Código-fonte Java (Auth, CRM, Scanner, Configs)
│   ├── src/main/resources/   # application.yml, migrations Flyway (db/migration)
│   ├── Dockerfile            # Containerização para deploy (Render/Cloud)
│   └── pom.xml               # Dependências Maven
├── frontend/                 # Single Page Application (SPA)
│   ├── src/
│   │   ├── components/       # Modais, Sidebars, Navbars, Controles
│   │   ├── views/            # Dashboard, Kanban, Scanner, Empresas, Propostas, etc.
│   │   ├── services/         # Clientes de API, Gerenciador de contas, Permissões
│   │   └── utils/            # Paletas, temas e utilitários
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml        # Orquestração local (Postgres, Backend, Frontend, PgAdmin)
├── .env.example              # Modelo de variáveis de ambiente
└── vercel.json               # Configurações de rewrite e deploy da SPA na Vercel
```

---

## ⚙️ Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz baseado no `.env.example`:

```bash
# Banco de Dados
DB_HOST=aws-0-us-east-2.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua-chave-secreta-minimo-256-bits-crm-scanner-2025
JWT_ACCESS_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Google Maps / Places (Opcional)
GOOGLE_MAPS_API_KEY=sua_api_key_aqui

# Porta do Backend
SERVER_PORT=8080
```

---

## 🏃 Como Executar Localmente

### 1. Pré-requisitos
- **Java 21 JDK** instalado
- **Node.js 20+** e **npm** instalados
- **Docker & Docker Compose** (opcional, para rodar com banco local)

### 2. Rodando o Backend
```bash
cd backend
./mvnw clean spring-boot:run
```
A API estará acessível em `http://localhost:8080`.
Documentação Swagger: `http://localhost:8080/swagger-ui.html`.

### 3. Rodando o Frontend
```bash
cd frontend
npm install
npm run dev
```
A aplicação abrirá em `http://localhost:5173`.

### 4. Rodando via Docker Compose (Stack Completa)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PgAdmin: `http://localhost:5050`

---

## 🧪 Testes & Build de Produção

### Frontend
```bash
cd frontend
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```

### Backend
```bash
cd backend
./mvnw clean package -DskipTests
```

---

## 🔒 Segurança e Boas Práticas
- Nenhuma credencial ou segredo em código ou arquivos de teste no repositório.
- Validação estrita de hooks do React 19 (Rules of Hooks).
- Suporte a poolers transacionais de banco de dados (`prepareThreshold=0`, limite seguro de pool Hikari para evitar limites de conexões).
