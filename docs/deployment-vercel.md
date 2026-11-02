# Deploy do Integra SGI na Vercel

## Arquitetura encontrada

Monorepo npm Workspaces: `frontend` (`@integra/web`, React/Vite), `backend`
(`@integra/api`, NestJS 11 com adaptador Express), `packages/shared`
(`@integra/shared`, compilado em CommonJS). Node 22.14.0 na CI (engines limitado a >=22.14.0 <23), PostgreSQL 17,
Prisma 7 com `@prisma/adapter-pg`. Não se trata de uma API Express independente.

`backend/src/main.ts` mantém o servidor local. `backend/api/index.ts` já inicializa
Nest sem `listen`, reutiliza a aplicação aquecida e chama a mesma `configureApp`:
prefixo `/api/v1`, Helmet, CORS, validação de origem, cookies e filtro de erros.
Nenhum endpoint ou contrato foi alterado. O client Prisma é gerado antes de `nest
build`; `dist/**` é incluído explicitamente na Function, e o tracing resolve os
pacotes compartilhados, pg e Argon2 nativo no runner Linux.

Sessões persistem no banco; arquivos usam S3 e URLs assinadas. Não foram encontrados
WebSockets, cron, jobs contínuos ou uploads persistidos no disco local. A Function
possui limite de 30 segundos. Pools pg são por instância: use conexão pooled/TLS e
limites adequados no provedor; escalabilidade de Functions não equivale a conexões
ilimitadas. O health atual verifica inicialização, não executa consulta ao banco
em cada chamada. A inicialização aquecida existente não serializa primeiros
requests concorrentes; monitore cold starts e consumo de conexões.

## Preparação manual (não executada pela implementação)

1. Criar/configurar dois projetos no mesmo repositório, `integra-sgi-web` e
   `integra-sgi-api`, sem iniciar deploy. Não contratar recursos pagos sem aprovação.
2. Configurar conforme tabela; habilitar **Include source files outside of the
   Root Directory in the Build Step** nos dois projetos.
3. Configurar PostgreSQL persistente separado para homolog e production. O banco
   descartável da CI nunca é usado no CD. Configurar armazenamento e email por
   ambiente; publicar os templates pelo procedimento existente, se necessário.
4. Configurar domínios, DNS/TLS e variáveis antes de ativar o pipeline.

| Projeto | Root Directory | Preset | Node | Output |
| --- | --- | --- | --- | --- |
| integra-sgi-web | `frontend` | Vite | 22.x | `dist` |
| integra-sgi-api | `backend` | Other | 22.x | `public` (vazio; código somente em Functions) |

Os comandos em cada `vercel.json` instalam a partir da raiz do monorepo com
`--include=dev`, para manter compiladores disponíveis mesmo em NODE_ENV=production. A API
compila shared, gera Prisma e compila Nest. O web compila shared e Vite. O rewrite
SPA existe apenas no projeto web; o projeto API encaminha tudo ao handler Nest.

Os dois arquivos desabilitam `git.deploymentEnabled`: a integração Git não deve
publicar automaticamente. Confirmar isso também no painel antes da ativação,
inclusive em branches antigas que ainda não tenham esses arquivos. Não utilizar
Deploy Hooks ou outros workflows de publicação em paralelo.

Para vincular projetos **já criados**, executar da raiz do monorepo (não de
`backend` ou `frontend`), usando a mesma versão exata de CLI definida no GitHub:

```bash
export VERCEL_CLI_VERSION='<versão exata validada, sem ^ ou latest>'
npx --yes "vercel@$VERCEL_CLI_VERSION" login
npx --yes "vercel@$VERCEL_CLI_VERSION" link --project integra-sgi-api --scope <team-slug>
# Registrar orgId e projectId de .vercel/project.json no GitHub Environment.
npx --yes "vercel@$VERCEL_CLI_VERSION" link --project integra-sgi-web --scope <team-slug>
# Registrar o segundo projectId; não versionar .vercel/.
```

O CD usa dois checkouts completos separados (`api-source`, `web-source`) e IDs
explícitos, com comandos Vercel na raiz de cada checkout. Isso impede que um pull
ou build sobrescreva os settings, env ou `.vercel/output` do outro projeto.

## Domínios Vercel, autenticação e homologação estável

O app pode usar os domínios Vercel dos projetos, sem configurar DNS próprio:
`WEB_DOMAIN` aponta para o alias web e `API_DOMAIN` para o alias da API. Use
aliases distintos entre `homolog` e `production`; o workflow atribui os aliases
estáveis de homolog com `vercel alias set` e promove os de produção.

Os domínios `*.vercel.app` da web e da API são sites diferentes, e os cookies de
sessão são `HttpOnly`, `Secure` e `SameSite=Lax`. Para manter a sessão, o web usa
`/api/v1` no mesmo host. Durante o build de homologação/produção, o workflow cria
um rewrite externo `/api/*` para `API_DOMAIN`; a Vercel encaminha a chamada sem
mudar a URL visível no browser. O rewrite injeta o bypass da API no servidor,
usando `VERCEL_API_BYPASS_SECRET` do ambiente do projeto web. Esse valor não vai
para o bundle do browser. O rewrite também desativa cache para caminhos `/api/*`.

CORS e validação de origem da API continuam limitados a `FRONTEND_URL`, com
credentials. Definir `TRUST_PROXY_HOPS=1` e validar a cadeia de proxies Vercel no
primeiro teste integrado. Se houver outro proxy/CDN, revisar a contagem antes de
confiar no IP. Deployment Protection pode bloquear preview e health; o bypass
de automação deve ser configurado nos projetos correspondentes.

## GitHub Actions: proteção, secrets e variáveis

Criar Environments `homolog` e `production` com **required reviewers**, impedir
self-review e restringir quem pode ignorar a aprovação. Sem essa configuração,
`environment:` sozinho **não exige aprovação**. Disponibilidade desses recursos
depende do plano/visibilidade do repositório; não ativar publicação se o gate não
estiver disponível. Nesse caso é necessário redesenhar o gate antes de ativar.

O evento `workflow_run` roda com o contexto da branch padrão: permitir essa branch
nas regras dos Environments e manter os filtros/SHA do workflow. Não presumir que
as regras de deployment branches enxerguem `head_branch=homolog`. O workflow deve
existir na branch padrão para receber o evento. Revisores devem conferir SHA,
branch, migrações e ambiente exibidos na execução da CI de origem.

Em `main` e `homolog`, configurar rulesets: PR obrigatório, aprovação de revisão,
check `verify` da CI obrigatório, branch atualizada antes de merge, bloqueio de
force-push/exclusão e bypass administrativo restrito. Proteger mudanças em
`.github/workflows`, `scripts`, configs Vercel e migrações com revisão obrigatória.
Essas configurações externas não são aplicadas por este PR.

Secrets **em cada Environment**, nunca em arquivos versionados:

| Secret | Uso |
| --- | --- |
| `VERCEL_TOKEN` | Token de serviço com acesso aos dois projetos |
| `VERCEL_ORG_ID` | Team/org da Vercel |
| `VERCEL_API_PROJECT_ID` | Projeto integra-sgi-api |
| `VERCEL_WEB_PROJECT_ID` | Projeto integra-sgi-web (ID diferente) |
| `DIRECT_URL` | Conexão direta ao banco daquele ambiente para migrações |
| `VERCEL_API_BYPASS_SECRET` | Bypass de proteção da API para health checks e chamadas encaminhadas pelo proxy web |
| `VERCEL_WEB_BYPASS_SECRET` | Opcional: bypass de proteção do web para health checks |

Variáveis **em cada Environment**: `API_DOMAIN`, `WEB_DOMAIN` (somente hostname
Vercel terminado em `.vercel.app`), `VERCEL_CLI_VERSION` (versão exata `X.Y.Z`,
validada primeiro em homolog). Os IDs podem ser iguais entre Environments porque
são dois projetos com Preview e Production; credenciais de banco devem ser diferentes.

## Variáveis Vercel

Configurar Preview com escopo de branch `homolog` e Production separadamente.
Não adicionar segredos de produção ao Preview genérico.

| Projeto | Variáveis |
| --- | --- |
| API | `APP_ENV=homolog` ou `production`; `NODE_ENV=production`; `DATABASE_URL`; `DIRECT_URL`; `SESSION_SECRET` (aleatório, >=32 caracteres); `APP_URL`; `FRONTEND_URL`; `TRUST_PROXY_HOPS=1` |
| API/email | `RESEND_API_KEY`, `EMAIL_FROM` |
| API/storage | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`; opcional `AWS_PUBLIC_ENDPOINT_URL_S3` |
| Web | `VITE_API_URL=/api/v1`; `VERCEL_API_BYPASS_SECRET` igual ao bypass de automação criado no projeto API |

`APP_URL` e `FRONTEND_URL` devem ser `https://<WEB_DOMAIN>` sem barra final.
O workflow gera a rota `/api/*` para `API_DOMAIN` do GitHub Environment.
O secret `VERCEL_API_BYPASS_SECRET` precisa existir no ambiente correspondente
do projeto web e coincidir com o secret de bypass `VERCEL_API_BYPASS_SECRET` do
GitHub Environment, pois o teste do workflow confere os dois sem imprimir valores.
`DATABASE_URL` usa o pooler do provedor quando disponível; `DIRECT_URL` usa conexão
direta TLS ao **mesmo banco**. Não imprimir URLs completas nos logs.
O CD verifica que DIRECT_URL do GitHub é idêntica à obtida da Vercel, para reduzir
risco de migrar um banco e publicar contra outro. Cabe ao operador confirmar que
DATABASE_URL e DIRECT_URL apontam para o mesmo banco, mesmo com hosts distintos.

Não configurar `SEED_ADMIN_*` em ambientes publicados. Migração não cria usuário
administrador nem sincroniza templates. Provisionamento inicial usa os comandos
existentes, separadamente e mediante aprovação. Nunca colocar credenciais em
variáveis `VITE_*`: seus valores são públicos no bundle.

## Pipeline e migrações

1. PR para homolog/main executa a CI existente, sem CD.
2. Push executa Node 22.14.0, Postgres 17 Alpine, npm ci, migrações temporárias,
   lint, build, testes de workspaces e Playwright. Nenhuma validação foi removida; foram acrescentados cinco testes locais de
   segurança e ordem da publicação.
3. Somente `CI` concluída com sucesso por evento push do mesmo repositório dispara
   CD. Checkout usa `workflow_run.head_sha`, nunca a ponta móvel da branch. A branch
   local é recriada nesse SHA para preservar o escopo de variáveis Preview.
4. Aguarda aprovação do Environment. Concorrência por branch usa
   `cancel-in-progress: false`, evitando interromper migrações/publicações em curso.
   GitHub pode substituir execuções pendentes; não há garantia FIFO. SHA antigo
   é rejeitado antes do build e novamente antes da migração.
5. Pull de settings/env e `vercel build` de cada projeto no runner. Production
   usa `--prod`; homolog usa Preview. Verificação do pacote exige Node 22,
   Nest, Prisma gerado, shared, pg e Argon2 nativo. Web exige index.html.
6. Verifica consistência das variáveis. Executa somente
   `npm run db:migrate:deploy --workspace @integra/api` contra DIRECT_URL do
   Environment aprovado. Nunca `migrate dev`, seed, reset ou migração no build.
7. Publica API com `vercel deploy --prebuilt --skip-domain`, testa a URL imutável,
   promove em produção ou atribui alias em homolog e testa o domínio estável.
8. Somente então publica/testa/promove o web da mesma forma. Logs ficam na execução
   e na Vercel; URLs e SHA ficam no Job Summary. Não há upload de `.vercel` como
   artefato público, pois `pull` armazena secrets locais.

Build falho não migra; migração falha não publica; API falha não publica web.
Uma branch pode avançar depois da última checagem; o SHA publicado ainda foi
validado, e a execução seguinte publica o novo SHA. Não há lock global entre
GitHub, execuções manuais e outros repositórios: proibir migrações paralelas fora
deste fluxo. Prisma também utiliza advisory locking; não desabilitá-lo.

Aprovar migrações significa revisar os SQLs. O pipeline não tenta classificar
SQL destrutivo por regex. Exigir aprovação explícita de qualquer DROP, perda de
dados, mudança incompatível ou lock prolongado. Fazer backup/PITR e usar
**expand/contract**: adicionar estruturas compatíveis, publicar consumidores,
backfill controlado e somente remover estruturas antigas em release posterior.
Versões antiga e nova coexistem durante o rollout.

## Falhas parciais e rollback

Não existe transação entre os dois projetos. Registrar URLs anteriores pelo
painel antes da aprovação. Se API foi promovida e web falhou, manter web anterior
somente se compatível; corrigir/reexecutar ou reverter API. Se health falhou antes
da promoção, o domínio anterior permanece, mas as migrações já podem ter ocorrido.
Se health do domínio falhou após promoção, tratar como incidente de publicação.

Rollback é **manual e aprovado**, sem migração reversa automática:

```bash
# Produção: em checkout vinculado ao projeto correto, executar para cada projeto afetado.
npx --yes "vercel@$VERCEL_CLI_VERSION" rollback <deployment-anterior> --token "$VERCEL_TOKEN"
# Homolog: restaurar o alias para o deployment Preview anterior, no projeto correto.
npx --yes "vercel@$VERCEL_CLI_VERSION" alias set <url-anterior> <dominio-homolog> --token "$VERCEL_TOKEN"
```

Verificar `/api/v1/health`, login, cookies e navegação após rollback. Reverter
código não reverte schema nem recupera dados. Não executar rollback de código
incompatível com o schema atual; preferir fix forward. Uma migration com falha
exige diagnóstico e recuperação manual do Prisma; não usar `migrate resolve`
sem entender o estado efetivo do banco. Reexecução integral aplica somente
migrações pendentes e cria novos deployments; health checks continuam obrigatórios.

## Validação local e troubleshooting

Usar somente banco local descartável para os comandos de testes (alguns testes
integração usam explicitamente localhost:5432/integra_sgi):

```bash
npm ci
npm run lint
npm run build
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/integra_sgi npm run db:migrate:deploy
npm test --workspaces --if-present
npx playwright install chromium
npm run test:e2e --workspace @integra/web
```

Após vincular e configurar Preview, validar empacotamento sem publicar nem migrar:

```bash
# Da raiz, vinculada à API. Requer acesso Vercel e baixa secrets para .vercel/.
npx --yes "vercel@$VERCEL_CLI_VERSION" pull --yes --environment=preview --git-branch=homolog
npx --yes "vercel@$VERCEL_CLI_VERSION" build
node scripts/check-vercel-package.mjs .vercel/output
```

- Shared/Prisma ausente: conferir Root Directory, inclusão de fontes externas,
  geração Prisma e comandos do build; não publicar ignorando a verificação.
- Argon2: build/deploy deve ser Linux, Node 22, mesma arquitetura do runtime.
- API 500: conferir variáveis obrigatórias, TLS, pooler, logs da Function e cold start.
- 401/403 no health: conferir Deployment Protection e bypass por projeto.
- Login sem persistência: conferir domínio same-site, HTTPS, origem exata e cookies.
- Migração bloqueada: conferir conexão direta, permissões DDL, advisory lock e
  outras execuções; nunca usar banco de CI como fallback.
- SPA 404: conferir preset Vite, output dist e rewrite somente no web.
- CD não iniciou: conferir workflow na branch padrão, nome CI, evento push,
  conclusão success, revisores e regras do Environment.
- `Superseded commit`: aguardar a CI do SHA atual; não forçar deploy do SHA antigo.
- Builds usando Node diferente: fixar 22.x no painel dos dois projetos.

Para nova variável, atualizar schema e `.env.example` quando aplicável; cadastrar
os valores separadamente no Preview/homolog e Production. Se necessária durante
migração/CD, adicionar secret/var no Environment e referência explícita no workflow.
Reexecutar CI/CD; variáveis VITE exigem rebuild. Nunca versionar arquivos obtidos
por `vercel pull` nem exibir seu conteúdo nos logs.

## Checklist de ativação

- [ ] Revisar e integrar workflow/config/scripts em main e homolog; CD na branch padrão.
- [ ] Configurar dois projetos, Root Directories, Node 22 e fontes externas.
- [ ] Desativar deploy Git automático e quaisquer canais paralelos de publicação.
- [ ] Provisionar bancos separados, backups, storage e email, sem compras não aprovadas.
- [ ] Configurar env Vercel e GitHub, versão exata da CLI e IDs corretos.
- [ ] Configurar aliases `.vercel.app` estáveis de homolog e Production para API e web.
- [ ] Habilitar reviewers, regras de branches e proteção dos arquivos de deploy.
- [ ] Validar build/prebuilt completo e login/logout em homolog.
- [ ] Testar falha de CI, reprovação, health falho e rollback em homolog.
- [ ] Revisar SQL, compatibilidade e URLs anteriores antes da primeira produção.
- [ ] Autorizar manualmente primeira produção e conferir health, login e logs.

Referências oficiais: [monorepos](https://vercel.com/docs/monorepos),
[build](https://vercel.com/docs/cli/build), [deploy prebuilt](https://vercel.com/docs/cli/deploy),
[aliases](https://vercel.com/docs/cli/alias),
[desabilitar deploy Git](https://vercel.com/docs/project-configuration/git-configuration).

## Resultado da validação desta implementação

Validação local em 2026-10-28, Node 22.14.0 e Vercel CLI 65.5.0:

- `npm ci`, lint e build dos workspaces: passaram.
- `npm test --workspaces --if-present`: 157 testes passaram (38 shared, 119 API).
- `node --test scripts/deployment.test.mjs`: 5 testes passaram.
- Playwright: 122 testes passaram após instalar o Chromium exigido.
- `actionlint` 1.7.7: ambos os workflows válidos; sintaxe Bash/JS e diff também válidos.
- `vercel build` da API em Preview e Production e do web em Production: passaram
  com settings locais fictícios, sem login, pull remoto ou publicação.
- Pacote da API: Node 22, Nest, Prisma, shared, pg e Argon2 presentes; imports do
  handler e dependências compiladas passaram; nenhum arquivo .env no pacote.

Os builds foram feitos em macOS ARM64; o pacote Linux definitivo será produzido
pelo runner Ubuntu. Ainda é necessário validar os settings reais, secrets,
conectividade do banco, migrações aprovadas, login com domínios reais e promoção
em homolog. Nenhum deploy real nem migração de banco persistente foi executado.
`npm ci` reportou 26 vulnerabilidades existentes (3 baixas, 4 moderadas, 17 altas,
2 críticas); não houve atualização automática das dependências. O Vite também
manteve o aviso existente de chunk maior que 500 kB.
