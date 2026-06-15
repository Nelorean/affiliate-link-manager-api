# Affiliate Link Manager API

API REST para criar, organizar e acompanhar links de afiliados, com autenticação JWT, PostgreSQL e redirecionamento por URLs personalizadas.

## Funcionalidades

- Cadastro e autenticação de usuários com JWT
- Criação de links com slug personalizado
- Organização por campanha e observações
- Links permanentes ou com data de expiração
- Contagem de cliques
- Ativação e desativação de links
- Filtros, busca e paginação
- Isolamento dos links por usuário
- Redirecionamento público pelo slug
- Documentação interativa com Swagger
- Testes automatizados de integração

## Tecnologias

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- Docker
- JSON Web Token
- Zod
- Jest e Supertest
- Swagger/OpenAPI
- ESLint e Prettier

## Como executar

### Pré-requisitos

- Node.js
- Docker Desktop
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/Nelorean/affiliate-link-manager-api.git
cd affiliate-link-manager-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` com base no `.env.example`:

```env
PORT=3000
DATABASE_URL="postgresql://affiliate_user:affiliate_password@localhost:5432/affiliate_links"
JWT_SECRET="substitua_por_uma_chave_segura"
```

### 4. Inicie o PostgreSQL

```bash
docker compose up -d
```

### 5. Aplique as migrations

```bash
npx prisma migrate deploy
```

### 6. Inicie a API

```bash
npm run dev
```

A API estará disponível em:

```text
http://localhost:3000
```

## Documentação da API

Com a aplicação em execução, acesse:

```text
http://localhost:3000/api-docs
```

A documentação Swagger permite visualizar e testar as rotas da API.

## Testes

Para executar os testes automatizados:

```bash
npm test
```

Os testes utilizam um banco PostgreSQL separado, configurado em `.env.test`.

## Qualidade de código

```bash
npm run lint
npm run format
npm run format:check
```

## Estrutura do projeto

```text
src/
├── config/
├── controllers/
├── docs/
├── middlewares/
├── routes/
├── services/
└── validations/

prisma/
├── migrations/
└── schema.prisma

tests/
├── auth.test.js
├── health.test.js
├── links.test.js
└── setup.js
```
