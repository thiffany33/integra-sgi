# Integra SGI

Plataforma de orientação para implementar Sistemas Integrados de Gestão. O monorepo mantém a aplicação React e a API NestJS separadas e partilha apenas contratos Zod e tipos.

## Estrutura

```text
frontend/          React 19, TypeScript, Vite, React Router, Tailwind e shadcn/ui
backend/           NestJS 11, REST, autenticação, email e Prisma
  prisma/          Schema e migrações SQL versionadas
packages/shared/   Schemas e tipos usados pela API e pelo frontend
compose.yaml       PostgreSQL, migrações, API e frontend para desenvolvimento local
```

## Desenvolvimento local

Requer Node.js 22.14+, npm com workspaces e Docker. Copie `.env.example` para `.env` se quiser alterar as opções locais; os valores padrão do Compose bastam para iniciar a base e as aplicações.

```bash
npm ci
docker compose up --build
```

O Compose inicia PostgreSQL em `localhost:5432`, aplica as migrações com `prisma migrate deploy`, inicia a API em `http://localhost:3001/api/v1` e o frontend em `http://localhost:5173`. O volume `postgres_data` conserva a base local. O serviço de email precisa de uma chave Resend configurada para entregar mensagens; a ausência dela não impede a execução local.

Para desligar os serviços sem apagar a base:

```bash
docker compose down
```

Para apagar também a base local e o volume:

```bash
docker compose down -v
```

Sem Docker, inicie só a base com `docker compose up -d db`, copie `backend/.env.example` para `backend/.env` e use:

```bash
npm run db:migrate:dev -- --name init
npm run dev
```

### Acesso administrador local

Para entrar na área administrativa durante o desenvolvimento, defina `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` no `backend/.env` (use uma senha local com pelo menos 12 caracteres). Depois de iniciar o PostgreSQL e aplicar as migrações, execute:

```bash
npm run db:seed --workspace @integra/api
```

Use na tela de login exatamente o email e a senha definidos no seu `backend/.env`. O comando cria ou atualiza essa conta como administradora da plataforma, marca o email como verificado e garante um perfil associado. A senha é armazenada com Argon2; o comando não a imprime. Ele recusa qualquer `APP_ENV` diferente de `development`; não configure essas três variáveis na Vercel, em homologação ou em produção.

`npm run dev` inicia web e API. Também existem `npm run dev:web` e `npm run dev:api`. Para verificações locais, use `npm run lint`, `npm run build`, `npm test --workspaces --if-present` e `npm run test:e2e --workspace @integra/web`.

## Banco de dados e migrações

Desenvolvimento usa PostgreSQL local por Docker. Homologação e produção devem ter bases Neon separadas, cada qual com o seu `DATABASE_URL` de runtime e `DIRECT_URL` de migração. Nunca configure a URL de produção no projeto de homologação.

Crie alterações de schema com `npm run db:migrate:dev -- --name nome-da-migracao` e comite a pasta gerada em `backend/prisma/migrations/`. Deploy usa `npm run db:migrate:deploy`. Não use `prisma db push` como mecanismo normal de publicação. O projeto da API na Vercel aplica as migrações durante o build, contra a base definida naquele ambiente; valide primeiro em homologação.

## Ambientes Vercel e Neon

Crie dois projetos Vercel ligados ao mesmo repositório:

- **Frontend:** Root Directory `frontend`, framework Vite, saída `dist`, com `frontend/vercel.json` para devolver `index.html` nas rotas do React Router.
- **API:** Root Directory `backend`, runtime Node.js, função `api/index.ts`, com `backend/vercel.json`. Ative **Include source files outside of the Root Directory** para o workspace `@integra/shared`; a instalação e o build usam o lockfile do monorepo. O build executa `prisma migrate deploy` e depois compila a API. A API não usa a regra SPA do frontend.

Configure variáveis por ambiente, sem as copiar entre homologação e produção:

- Frontend: `VITE_API_URL=https://api-homolog.example.com/api/v1` ou `https://api.example.com/api/v1`.
- API: `APP_ENV`, `NODE_ENV=production`, `DATABASE_URL`, `DIRECT_URL`, `APP_URL`, `FRONTEND_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM` e `TRUST_PROXY_HOPS`.
- Homologação: branch `homolog`, domínio `homolog.example.com`, API `api-homolog.example.com`, base Neon de homologação e segredos próprios.
- Produção: branch `main`, domínio `example.com`, API `api.example.com`, base Neon de produção e segredos próprios.

`FRONTEND_URL` deve ser a origem exata do frontend correspondente; CORS e cookies são configurados por ambiente. Em Vercel, defina `TRUST_PROXY_HOPS` conforme a topologia validada da plataforma. O cookie de sessão é `HttpOnly`, `Secure` nos ambientes publicados e `SameSite=Lax`. As credenciais do banco, o segredo de sessão e a chave Resend existem apenas na API; nenhuma delas usa o prefixo `VITE_`.

Promova mudanças primeiro para `homolog`, valide aplicação e migrações na base isolada e só depois integre em `main`. Não publique projetos Vercel, domínios ou bases externas a partir deste repositório.

## Idiomas e dados

A interface suporta `pt-PT`, `en`, `fr` e `de`. A preferência de um utilizador autenticado fica no PostgreSQL; a escolha anónima dura apenas a sessão da página. Sessões usam cookie HTTP-only. O perfil de organização fica num JSON validado no PostgreSQL, associado ao utilizador. A aplicação não usa localStorage, sessionStorage ou IndexedDB.

Ficheiros `.env` não são versionados. Os `.env.example` contêm apenas placeholders. A pasta `docs/` também fica ignorada pelo Git conforme a decisão do projeto.
