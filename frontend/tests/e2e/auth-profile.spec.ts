import { test, expect } from '@playwright/test'

const profile = {
  schemaVersion: 1,
  organization: { name: 'Cooperativa Exemplo', nif: '123456789', sector: 'Serviços', email: 'contato@example.pt' },
  representative: { name: 'Maria Silva', email: '', phone: '' },
  selectedSystems: ['sgq'],
}

const authPayload = {
  user: { id: 'user-1', name: 'Maria Silva', email: 'contato@example.pt', locale: 'pt-PT', emailVerifiedAt: null },
  profile,
}

test('login recarrega perfil pelo servidor e regressa ao requisito pedido', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: { error: { code: 'UNAUTHENTICATED', message: 'Sign in.' } } }));
  await page.route('**/api/v1/auth/login', route => route.fulfill({ status: 200, json: authPayload }));
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }));
  await page.goto('/login?returnTo=%2Frequirement4_2');
  await page.getByLabel('Email').fill('contato@example.pt');
  await page.getByLabel('Palavra-passe').fill('correct-horse-battery');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/requirement4_2/);

  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 200, json: authPayload }));
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Suas áreas de gestão' })).toBeVisible();
  await expect(page.getByRole('main').getByText('Gestão da Qualidade', { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByText('Gestão Ambiental', { exact: true })).toHaveCount(0);
  const nav = page.getByRole('navigation', { name: 'Navegação principal' });
  await expect(nav.getByRole('link', { name: 'Meu plano' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Modelos' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Criar conta' })).toHaveCount(0);
  await page.route('**/api/v1/auth/logout', route => route.fulfill({ status: 204, body: '' }));
  const accountMenu = nav.getByRole('button', { name: 'Menu da conta de Maria Silva' });
  await accountMenu.click();
  await page.getByRole('menuitem', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(nav.getByRole('link', { name: 'Entrar' })).toBeVisible();
});

test('returnTo externo cai no painel e nunca redireciona para outro host', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }));
  await page.route('**/api/v1/auth/login', route => route.fulfill({ status: 200, json: authPayload }));
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }));
  await page.goto(`/login?returnTo=${encodeURIComponent('//example.com')}`);
  const localOrigin = new URL(page.url()).origin;
  await page.getByLabel('Email').fill('contato@example.pt');
  await page.getByLabel('Palavra-passe').fill('correct-horse-battery');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(new URL(page.url()).origin).toBe(localOrigin);
});

test('acesso reúne as ações entrar e criar conta em separadores acessíveis', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }));
  await page.goto('/login');
  await expect(page.getByRole('tab', { name: 'Entrar' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Criar conta' })).toBeVisible();
  await page.getByRole('tab', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/register/);
  await expect(page.getByRole('heading', { name: /organização/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Criar conta' })).toHaveAttribute('aria-selected', 'true');
});

test('assistente mantém o retorno solicitado até terminar o registo', async ({ page }) => {
  const registrations: Record<string, unknown>[] = [];
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }));
  await page.route('**/api/v1/auth/register', route => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    registrations.push(body);
    route.fulfill({ status: 201, json: { user: { ...authPayload.user, name: body.name, email: body.email }, profile: body.profile } });
  });
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile: registrations[0]?.profile, revision: 1, updatedAt: new Date().toISOString() } }));
  await page.goto('/register?returnTo=%2Frequirement4_2');
  await page.getByLabel('Nome da organização').fill('Cooperativa Atlântico');
  await page.getByLabel('NIF').fill('123456789');
  await page.getByLabel('Ramo de atividade').selectOption('Serviços');
  await page.getByLabel('Email principal').fill('contato@atlantico.pt');
  await page.getByRole('button', { name: 'Continuar para representante' }).click();
  await expect(page).toHaveURL(/representative\?returnTo=%2Frequirement4_2/);
  await page.getByLabel('Nome do representante').fill('Maria Silva');
  await page.getByRole('button', { name: 'Continuar para sistemas' }).click();
  await expect(page).toHaveURL(/select-systems\?returnTo=%2Frequirement4_2/);
  await page.getByRole('checkbox', { name: /Gestão Ambiental/ }).uncheck();
  await page.getByRole('checkbox', { name: /Segurança e Saúde no Trabalho/ }).uncheck();
  await page.getByLabel('Crie uma palavra-passe').fill('correct-horse-battery');
  await page.getByRole('button', { name: 'Criar conta e ver o meu plano' }).click();
  await expect(page).toHaveURL(/requirement4_2$/);
});

test('início de uma sessão autenticada abre diretamente o meu plano', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 200, json: authPayload }));
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }));
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Suas áreas de gestão' })).toBeVisible();
});

test('menu da conta mostra iniciais e reúne perfil e saída', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 200, json: authPayload }));
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }));
  await page.goto('/dashboard');
  const accountMenu = page.getByRole('button', { name: 'Menu da conta de Maria Silva' });
  await expect(accountMenu).toContainText('MS');
  await accountMenu.click();
  await expect(page.getByRole('menuitem', { name: 'O meu perfil' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Sair' })).toBeVisible();
});
