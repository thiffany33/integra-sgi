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
  await expect(nav.getByRole('link', { name: 'O meu perfil' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Criar conta' })).toHaveCount(0);
  await page.route('**/api/v1/auth/logout', route => route.fulfill({ status: 204, body: '' }));
  await nav.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(nav.getByRole('link', { name: 'Entrar' })).toBeVisible();
});

test('returnTo externo cai no painel e nunca redireciona para outro host', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }));
  await page.route('**/api/v1/auth/login', route => route.fulfill({ status: 200, json: authPayload }));
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }));
  await page.goto(`/login?returnTo=${encodeURIComponent('//example.com')}`);
  await page.getByLabel('Email').fill('contato@example.pt');
  await page.getByLabel('Palavra-passe').fill('correct-horse-battery');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(new URL(page.url()).host).toBe('127.0.0.1:4173');
});
