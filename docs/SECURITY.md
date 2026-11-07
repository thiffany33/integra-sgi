# Política de Segurança — Integra SGI

Este documento define as regras de segurança, privacidade e proteção de dados para o desenvolvimento, a manutenção e a operação do Integra SGI. Substitui a política original (`src/docs/security.MD`, junho de 2026) e descreve o que está efetivamente implementado na arquitetura atual.

Arquitetura de referência:

- **Web** (`frontend/`): React + Vite, servido como estático pela Vercel em `https://integrasig.pt`. O middleware da Vercel encaminha `/api/v1/*` para a API.
- **API** (`backend/`): NestJS na Vercel (Functions), projeto `integra-sgi-api`.
- **Base de dados**: Neon Postgres (branch `main` em produção, branch própria em homologação).
- **Ficheiros**: Neon Storage (compatível com S3), bucket privado, acesso apenas por URLs assinadas.
- **Email**: Resend.
- **CI/CD**: GitHub Actions, com segredos nos ambientes `homolog` e `production` do GitHub e nas variáveis da Vercel.

---

## 1. Segredos e variáveis de ambiente

1. Nenhum segredo (palavras-passe, tokens, chaves de API, URLs de base de dados com credenciais) entra no código-fonte, em logs ou em mensagens de commit/PR.
2. Ficheiros `.env` e `.env.*` estão no `.gitignore`. Apenas `.env.example`, sem valores reais, é versionado.
3. Os segredos vivem em dois sítios: nos **ambientes do GitHub** (usados no deploy e nas migrações) e nas **variáveis da Vercel**, marcadas como *Sensitive*.
4. Só variáveis com prefixo `VITE_` chegam ao browser, e nunca podem conter segredos. Hoje a única é `VITE_API_URL`.
5. A API valida todas as variáveis no arranque (`backend/src/config/env.schema.ts`). Em homologação e produção, a ausência de uma variável obrigatória impede o arranque.
6. O pipeline de deploy confirma, sem imprimir valores, que a base de dados das migrações é a mesma usada pela Vercel (`scripts/check-vercel-environment.mjs`).
7. Se houver suspeita de exposição de um segredo, ele é rodado imediatamente no fornecedor (Neon, Resend, Vercel, GitHub) e o valor antigo é revogado.

## 2. Autenticação e sessões

| Controlo | Implementação |
| --- | --- |
| Palavras-passe | Hash com Argon2id (`password-hashing.service.ts`). Nunca são guardadas nem registadas em claro. |
| Sessão | Token aleatório de 256 bits. Na base de dados guarda-se apenas o seu hash. |
| Cookie | `integra_session` com `HttpOnly`, `Secure` (homologação/produção), `SameSite=Lax`, validade de 7 dias. |
| Armazenamento no browser | Proibido guardar tokens ou dados pessoais em `localStorage`/`sessionStorage`. Os testes e2e verificam que o `localStorage` fica vazio. |
| Verificação de email | Obrigatória antes do primeiro login. |
| Limite de tentativas | Por IP e email: login 10/15 min; registo, recuperação e redefinição de palavra-passe 5/h; verificação de email 10/h. |
| Encerramento de sessão | O logout invalida a sessão no servidor e apaga o cookie. A alteração do email termina a sessão. |

## 3. Proteção da aplicação

1. **HTTPS obrigatório** em homologação e produção, com HSTS. `http://localhost` só é aceite em desenvolvimento.
2. **Cabeçalhos da API**: `helmet` com a configuração por omissão.
3. **Cabeçalhos do site** (`scripts/configure-vercel-web.mjs`), aplicados em todas as rotas:
   - `Content-Security-Policy`: só scripts do próprio domínio, sem `unsafe-eval`. As imagens podem vir do próprio domínio e do Neon Storage. `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`.
   - `X-Frame-Options: DENY` (proteção contra clickjacking).
   - `X-Content-Type-Options: nosniff`.
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `Permissions-Policy`: câmara, microfone, geolocalização e pagamentos desativados.
4. **CSRF**: cookie `SameSite=Lax` e, em pedidos `POST/PUT/PATCH/DELETE`, rejeição de qualquer `Origin` diferente de `FRONTEND_URL` (`origin.middleware.ts`). O CORS só aceita o domínio do site.
5. **Validação de entrada**: todos os corpos de pedido são validados com Zod, com esquemas partilhados entre web e API (`packages/shared`).
6. **Uploads**: foto de perfil limitada a 4 MiB e a JPEG, PNG ou WebP, com o tipo confirmado pelos bytes do ficheiro (não pela extensão). Os ficheiros ficam num bucket privado e só são servidos por URLs assinadas de curta duração (120 s).
7. **Erros**: o filtro global (`sanitized-exception.filter.ts`) não devolve stack traces nem detalhes internos ao cliente.
8. **Registo de auditoria** (`AuditEvent`, `audit.service.ts`): regista entradas, tentativas falhadas contra contas existentes, saídas, alterações e recuperação de palavra-passe, alterações de conta, de perfil e de foto, exportações e apagamentos de conta. Guarda apenas a conta, a ação e a data, sem IP nem conteúdo do pedido. Os registos são apagados ao fim de 12 meses, ou com a conta; o apagamento de uma conta deixa só um evento anónimo. As alterações de sistemas feitas por admins ficam em `CustomerSystemsChange`. Uma falha ao gravar o registo nunca bloqueia a ação.
9. **Acesso à API em pré-visualização**: os deploys da Vercel estão protegidos e o site acede à API com um segredo de bypass que só existe no servidor.

## 4. Controlo de acesso

1. Perfis: contas com `isAdmin = true` são da equipa Integra SGI; todas as outras são organizações clientes. A primeira conta administradora é criada pelo seed (`npm run db:seed`), que nunca altera uma conta existente.
2. Cada cliente só acede aos seus próprios dados: todas as consultas são filtradas pelo utilizador da sessão.
3. As rotas de administração exigem `isAdmin` (`platform-admin.guard.ts`).
4. Privilégio mínimo também na infraestrutura: só quem mantém o projeto tem acesso à Vercel, ao Neon e aos ambientes do GitHub. O ambiente `production` do GitHub deve exigir aprovação.

## 5. Desenvolvimento seguro

1. Todo o código entra por pull request, com CI verde (lint, typecheck, testes unitários, e2e e acessibilidade). Não há push direto para `main`.
2. Dependências: o `package-lock.json` é versionado e as atualizações são revistas. Vulnerabilidades conhecidas de severidade alta ou crítica são corrigidas antes do deploy seguinte.
3. As migrações de base de dados são versionadas e aplicadas apenas pelo pipeline, depois das verificações de ambiente.
4. Dados de produção nunca são copiados para desenvolvimento ou homologação.

## 6. Proteção de dados (RGPD)

O tratamento de dados pessoais segue o RGPD. O detalhe para os utilizadores está na Política de Privacidade (`/privacidade`).

- **Minimização**: recolhem-se apenas os dados da organização (nome, NIF, setor, email), do representante (nome, email, telefone), a foto de perfil opcional e as respostas ao diagnóstico.
- **Finalidade**: prestação do serviço de apoio à implementação de sistemas de gestão.
- **Dados agregados**: os indicadores do painel de administração usam apenas dados agregados e não expõem respostas individuais fora do perfil de administração.
- **Direitos dos titulares** (acesso, retificação, apagamento, portabilidade): no perfil, a pessoa corrige os dados, descarrega uma cópia em JSON (`GET /api/v1/account/export`) e apaga a conta (`POST /api/v1/account/delete`). Apagar exige a palavra-passe, tem limite de tentativas e remove a foto, as respostas, as sessões e o histórico de sistemas. As contas de administração não se podem apagar a si próprias. Outros pedidos são tratados pelo contacto de privacidade, no prazo legal de 30 dias.
- **Subcontratantes**: Vercel (alojamento), Neon (base de dados e ficheiros), Resend (email).

## 7. Testes de invasão

### 7.1 Âmbito

- Site (`https://integrasig.pt`) e API (`/api/v1/*`), incluindo autenticação, sessões, recuperação de palavra-passe, perfil, upload de ficheiros, diagnóstico e rotas de administração.
- Fora do âmbito: a infraestrutura dos fornecedores (Vercel, Neon, Resend, GitHub), testes de negação de serviço e engenharia social.

### 7.2 Regras de execução

1. Os testes ativos correm **apenas em homologação**, com contas de teste criadas para esse fim. Nunca em produção nem com dados reais.
2. Em produção só são permitidas verificações passivas: cabeçalhos, TLS e configuração exposta.
3. Os testes são combinados previamente com quem mantém o projeto. Qualquer teste externo exige autorização escrita.

### 7.3 Metodologia

Baseada no **OWASP Web Security Testing Guide** e no **OWASP ASVS nível 1**, cobrindo o OWASP Top 10:

| Área | O que se verifica |
| --- | --- |
| Controlo de acesso (A01) | Acesso a dados de outra organização (IDOR), rotas de admin com uma conta de cliente, ficheiros sem URL assinada. |
| Criptografia (A02) | TLS, HSTS, flags do cookie, ausência de dados sensíveis em URLs e logs. |
| Injeção (A03) | SQL/NoSQL nos campos do diagnóstico e do perfil, XSS armazenado e refletido. |
| Design inseguro (A04) | Fluxo de recuperação de palavra-passe, enumeração de contas, limites de tentativas. |
| Configuração (A05) | Cabeçalhos de segurança, CORS, mensagens de erro, endpoints expostos. |
| Componentes vulneráveis (A06) | `npm audit` e versões das dependências. |
| Autenticação (A07) | Força bruta, fixação e expiração de sessão, logout efetivo. |
| Integridade (A08) | Pipeline de deploy, origem das dependências, uploads de tipos não permitidos. |
| Registo e monitorização (A09) | Se os eventos de segurança ficam registados (ver lacunas). |
| SSRF (A10) | Pedidos do servidor a URLs controladas pelo utilizador (hoje não existem). |

### 7.4 Frequência

- **Automática**: verificação de dependências e dos cabeçalhos a cada pull request.
- **Manual, interna**: antes de cada lançamento com mudanças em autenticação, permissões ou upload, e pelo menos **uma vez por semestre**.
- **Externa** (empresa especializada): pelo menos **uma vez por ano** e antes de abrir a plataforma a novos mercados.

### 7.5 Classificação e prazos de correção

| Severidade (CVSS) | Prazo máximo |
| --- | --- |
| Crítica (9,0–10) | 48 horas, com mitigação imediata |
| Alta (7,0–8,9) | 7 dias |
| Média (4,0–6,9) | 30 dias |
| Baixa (< 4,0) | Próximo ciclo planeado |

Cada teste produz um relatório com âmbito, data, achados, evidências e estado de correção. Os relatórios não são versionados no repositório público.

## 8. Comunicação de vulnerabilidades

Quem encontrar uma vulnerabilidade deve comunicá-la de forma privada para o contacto de segurança do projeto (**a definir**), sem a divulgar publicamente até estar corrigida. A receção é confirmada em até 5 dias úteis.

## 9. Lacunas conhecidas e próximos passos

| Lacuna | Estado |
| --- | --- |
| Scan automático (OWASP ZAP baseline) contra homologação no CI | Proposto. |
| Contacto público de segurança e de privacidade | A definir. |
| Aprovação obrigatória no ambiente `production` do GitHub | A confirmar nas definições do repositório. |

---

Última atualização: novembro de 2026
