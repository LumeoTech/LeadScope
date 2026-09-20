
# LeadScope

<p align="center">
  <strong>Scanner de Empresas e Plataforma de Gestão Comercial</strong>
</p>

<p align="center">
  Transformando dados empresariais em oportunidades comerciais.
</p>

---

## Sobre o Projeto

O **LeadScope** é uma plataforma de prospecção comercial que integra um scanner de empresas a um sistema de CRM, permitindo centralizar a descoberta de potenciais clientes e o gerenciamento de oportunidades em um único ambiente.

A plataforma foi projetada para auxiliar equipes comerciais na identificação de empresas, organização de leads, acompanhamento de negociações e gerenciamento do relacionamento com clientes.

O projeto busca unir automação, organização de dados e produtividade em uma solução escalável e intuitiva.

## Principais Recursos

- Scanner de empresas com dados de fontes externas
- Organização e gerenciamento de leads
- Pipeline de oportunidades comerciais
- Histórico de interações e contatos
- Gerenciamento de reuniões e propostas
- Cadastro e acompanhamento de clientes
- Controle de acesso e permissões
- Distribuição organizada de leads
- Análise de presença digital
- Visualização geográfica de empresas

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | Java 21 |
| Framework | Spring Boot |
| Frontend | React + TypeScript |
| Build Frontend | Vite |
| Estilização | Tailwind CSS |
| Banco de Dados | PostgreSQL |
| Persistência | Spring Data JPA |
| Migrações | Flyway |
| Segurança | Spring Security + JWT |
| Documentação | OpenAPI / Swagger |
| Infraestrutura | Docker |
| Versionamento | Git + GitHub |

## Arquitetura

O projeto utiliza uma arquitetura organizada por camadas e domínios, buscando garantir:

- Separação de responsabilidades
- Manutenibilidade do código
- Segurança e controle de acesso
- Facilidade de testes
- Evolução e escalabilidade da aplicação

## Execução Local

### Pré-requisitos

- Java 21
- Node.js
- Docker Desktop
- Git

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

No Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Banco de Dados

O PostgreSQL pode ser executado utilizando Docker, conforme as configurações presentes no projeto.

## Configuração de Ambiente

As credenciais e chaves de integração devem ser configuradas por meio de variáveis de ambiente.

**Nunca exponha informações sensíveis no código-fonte ou no repositório público.**

## Status do Projeto

> Em desenvolvimento

Novos recursos e melhorias serão implementados progressivamente durante a evolução da plataforma.

## Objetivos Técnicos

Este projeto também tem como finalidade aplicar conhecimentos de:

- Desenvolvimento de APIs REST
- Arquitetura de software
- Segurança de aplicações
- Modelagem de banco de dados
- Integração com serviços externos
- Desenvolvimento frontend e backend
- Testes automatizados
- Boas práticas de engenharia de software

---

<p align="center">
  Desenvolvido com foco em tecnologia, organização e inovação.
</p>

<p align="center">
  <strong>LeadScope</strong>
</p>
