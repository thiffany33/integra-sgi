# Relatório de cópias de segurança — Integra SGI

Data: 11 de novembro de 2026. Base: Política de Retenção e Eliminação de Dados, Política de Segurança da Informação e `docs/SECURITY.md` §6.2.

## 1. O que existe

| Elemento | Situação |
| --- | --- |
| Base de dados (Neon, branch `main`) | Histórico de recuperação contínuo (point-in-time restore) de **6 horas**, gerido pelo Neon. Permite restaurar a base para qualquer momento das últimas 6 horas. |
| Snapshots do Neon | Nenhum. Não há agendamento de snapshots. |
| Exportações próprias (`pg_dump` ou outras) | Nenhuma. Não há cópias da base guardadas fora do Neon. |
| Fotos de perfil (Neon Storage) | Sem cópia própria. Uma foto apagada não se recupera. |
| Mensagens de contacto | Só existem na caixa de email da responsável (thiffanyg33@gmail.com). Não fazem parte da base de dados. |
| Código-fonte | No GitHub, com o histórico completo do git. As migrações da base estão no repositório, por isso o esquema pode ser recriado a qualquer momento. |
| Configuração e segredos | Nas variáveis da Vercel e nos segredos do GitHub. Não há cópia; em caso de perda, os segredos são gerados de novo (§1). |

## 2. O que isto significa

**Privacidade (ponto forte).** Um dado apagado, por exemplo quando uma conta é eliminada, deixa de existir em qualquer cópia ao fim de no máximo 6 horas. Não há cópias antigas com dados pessoais espalhadas por outros sítios.

**Disponibilidade (ponto fraco).** Só é possível recuperar de um problema detetado nas primeiras 6 horas. Um erro descoberto mais tarde, por exemplo uma migração que corrompeu dados ou uma eliminação indevida notada no dia seguinte, não tem recuperação. Também não há cópia independente do fornecedor: se a conta ou o projeto no Neon se perderem, perdem-se os dados.

## 3. Decisões tomadas

- Manter a janela de 6 horas, sem snapshots nem exportações próprias.
- Não fazer testes de restauro periódicos. A política de retenção prevê esses testes, por isso esta decisão é um **risco aceite** pela responsável, registado em `docs/SECURITY.md` §9.

## 4. Como restaurar, se for preciso

Resumo do procedimento em `docs/SECURITY.md` §6.2:

1. Agir dentro das 6 horas seguintes ao problema.
2. No Neon, em Backup & Restore, restaurar para uma **branch nova**, nunca diretamente sobre a produção.
3. Antes de usar a branch restaurada, voltar a apagar as contas que foram eliminadas depois do ponto restaurado (as que existem na branch restaurada mas já não existem na produção atual).
4. Só depois trocar a ligação da API e re-executar o workflow `Deploy` no GitHub para a API ler a ligação nova.

## 5. Recomendações (se o risco deixar de ser aceitável)

- Aumentar a janela de recuperação do Neon (opção "Configure"; pode exigir um plano pago).
- Ativar snapshots agendados do Neon, com uma retenção curta e documentada, atualizando a política de privacidade e a de retenção com o novo prazo.
- Fazer um teste de restauro para uma branch de teste depois de cada mudança grande no esquema.
