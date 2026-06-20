# Security Policy - Integra SIG

## Objetivo

Este documento estabelece as regras de segurança, privacidade e proteção de dados que devem ser seguidas durante todo o desenvolvimento, manutenção e operação da plataforma Integra SIG.

---

# 1. Gestão de Variáveis de Ambiente

## 1.1 Segregação de Informações Sensíveis

Informações sensíveis nunca devem ser armazenadas diretamente no código-fonte.

Exemplos:

* Tokens de acesso
* Chaves de API privadas
* Credenciais de banco de dados
* Segredos de autenticação
* Chaves criptográficas

---

## 1.2 Arquivos .env

Os arquivos de configuração contendo informações sensíveis não devem ser versionados.

Arquivos proibidos no Git:

```text
.env
.env.local
.env.development
.env.production
```

Os mesmos devem constar obrigatoriamente no `.gitignore`.

---

## 1.3 Variáveis Públicas

Somente informações destinadas ao frontend podem ser expostas através das variáveis públicas do Vite.

Exemplo:

```text
VITE_API_URL
VITE_FIREBASE_PROJECT_ID
```

É proibido expor:

* Senhas
* Tokens privados
* Chaves secretas
* Credenciais administrativas

---

## 1.4 Gestão Centralizada de Segredos

Toda configuração sensível deverá passar obrigatoriamente pela plataforma de gestão de segredos definida pelo projeto antes de qualquer processo de build ou deploy.

---

# 2. Gestão de Autenticação

## 2.1 Armazenamento de Tokens

É proibida a utilização de:

```javascript
localStorage
```

para armazenamento de tokens de autenticação.

Motivo:

* Vulnerabilidade a ataques XSS.
* Persistência excessiva de dados sensíveis.

---

## 2.2 Métodos Permitidos

Prioridade de utilização:

1. Memória da aplicação.
2. Context API.
3. Zustand.
4. sessionStorage (quando estritamente necessário).

---

## 2.3 Encerramento de Sessão

Dados de autenticação devem ser descartados automaticamente após:

* Logout.
* Encerramento da aba.
* Encerramento do navegador.
* Expiração da sessão.

---

# 3. Transporte Seguro

## 3.1 HTTPS Obrigatório

Todos os ambientes produtivos devem utilizar exclusivamente:

```text
https://
```

É proibido trafegar:

* Credenciais
* Tokens
* Dados pessoais
* Informações administrativas

através de HTTP.

---

## 3.2 Ambiente Local

É permitido utilizar:

```text
http://localhost
```

exclusivamente para desenvolvimento.

---

# 4. Proteção de Dados (RGPD / GDPR)

A plataforma deve seguir os princípios do Regulamento Geral de Proteção de Dados (RGPD) da União Europeia.

---

## 4.1 Minimização de Dados

Apenas os dados estritamente necessários devem ser recolhidos.

Exemplos permitidos:

* Nome da empresa
* NIF
* Nome do representante
* Email de contacto
* Telefone de contacto

Dados desnecessários não devem ser solicitados.

---

## 4.2 Finalidade

Todos os dados recolhidos devem possuir finalidade legítima, específica e claramente informada ao utilizador.

---

## 4.3 Transparência

O utilizador deve ser informado sobre:

* Quais dados são recolhidos.
* Por que são recolhidos.
* Como serão utilizados.
* Quanto tempo serão armazenados.

---

## 4.4 Direito ao Esquecimento

O utilizador deve poder solicitar:

* Exclusão dos seus dados.
* Encerramento da conta.
* Remoção de informações pessoais.

---

## 4.5 Direito de Acesso

O utilizador deve poder consultar os dados armazenados sobre si.

---

## 4.6 Portabilidade

Sempre que possível, os dados devem poder ser exportados em formato estruturado.

---

# 5. LGPD (Brasil)

A plataforma também deverá respeitar os princípios da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

Princípios aplicáveis:

* Finalidade
* Adequação
* Necessidade
* Livre acesso
* Qualidade dos dados
* Transparência
* Segurança
* Prevenção
* Não discriminação
* Responsabilização

---

# 6. Controlo de Acesso

## 6.1 Menor Privilégio

Cada utilizador deve possuir apenas as permissões necessárias para desempenhar suas funções.

---

## 6.2 Separação de Perfis

A plataforma deverá prever a existência de diferentes perfis de acesso.

Exemplo:

* Administrador
* Consultor
* Representante da empresa

---

# 7. Segurança de Desenvolvimento

## 7.1 Proibição de Segredos no Código

É proibido armazenar:

* Senhas
* Tokens
* Chaves privadas

diretamente em arquivos do projeto.

---

## 7.2 Dependências

Bibliotecas devem ser mantidas atualizadas.

Dependências abandonadas ou vulneráveis devem ser removidas.

---

## 7.3 Validação de Entrada

Toda entrada de dados deve ser validada.

Exemplos:

* Formulários
* URLs
* Campos de texto
* Uploads de arquivos

---

# 8. Registo e Auditoria

A plataforma deverá manter registos de eventos relevantes.

Exemplos:

* Login
* Logout
* Alteração de perfil
* Alteração de permissões
* Exclusão de dados

---

# 9. Boas Práticas do Projeto Integra SIG

* Nunca armazenar tokens em localStorage.
* Nunca versionar arquivos .env.
* Nunca expor segredos no frontend.
* Utilizar HTTPS em produção.
* Aplicar princípios de Privacy by Design.
* Aplicar princípios de Security by Design.
* Coletar apenas os dados necessários.
* Priorizar a proteção dos dados dos utilizadores desde a conceção da plataforma.

---

Última atualização: Junho de 2026
Projeto: Integra SIG
