import { expect, test, type Page } from '@playwright/test';

const customer = {
  userId: 'customer-1', name: 'Maria Silva', email: 'maria@example.pt', organizationName: 'Cooperativa Exemplo',
  selectedSystems: ['sgq'], revision: 1, updatedAt: '2026-10-04T12:00:00.000Z',
};

async function signInAs(page: Page, role: 'CUSTOMER' | 'PLATFORM_ADMIN') {
  const user = { id: role === 'CUSTOMER' ? 'customer-1' : 'admin-1', name: 'Utilizador', email: 'user@example.pt', locale: 'pt-PT', emailVerifiedAt: null, role };
  const profile = {
    schemaVersion: 1, organization: { name: 'Exemplo', nif: '123456789', sector: 'Serviços', email: 'user@example.pt' },
    representative: { name: 'Utilizador', email: '', phone: '' }, selectedSystems: ['sgq'],
  };
  await page.route('**/api/v1/auth/me', route => route.fulfill({ json: { user, profile } }));
  await page.route('**/api/v1/customers/me', route => route.fulfill({ json: { profile, revision: 1, updatedAt: customer.updatedAt } }));
}

test('customer cannot see or render the platform administration', async ({ page }) => {
  await signInAs(page, 'CUSTOMER');
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Empresas' })).toHaveCount(0);
  await page.goto('/admin/customers');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Gerir empresas' })).toHaveCount(0);
});

test('admin can search for an identified account and explicitly save selected systems', async ({ page }) => {
  await signInAs(page, 'PLATFORM_ADMIN');
  let matchingSearches = 0;
  await page.route('**/api/v1/admin/customers**', async route => {
    if (route.request().method() === 'PATCH') {
      expect(route.request().postDataJSON()).toEqual({ selectedSystems: ['sgq', 'sga'], revision: 1 });
      await route.fulfill({ json: { ...customer, selectedSystems: ['sgq', 'sga'], revision: 2 } });
      return;
    }
    const url = new URL(route.request().url());
    if (url.searchParams.has('search')) {
      expect(url.searchParams.get('search')).toBe('Maria');
      matchingSearches += 1;
    }
    await route.fulfill({ json: { items: [customer], nextCursor: null } });
  });
  await page.goto('/admin/customers');
  await expect(page.getByRole('link', { name: 'Empresas' })).toBeVisible();
  await page.getByLabel('Procurar por nome ou email').fill('Maria');
  await page.getByRole('button', { name: 'Procurar' }).click();
  await expect.poll(() => matchingSearches).toBe(1);
  await expect(page.getByRole('heading', { name: 'Cooperativa Exemplo' })).toBeVisible();
  await expect(page.getByText('maria@example.pt')).toBeVisible();
  await page.getByRole('button', { name: 'Editar sistemas de Cooperativa Exemplo' }).click();
  await page.getByRole('checkbox', { name: /ISO 14001/ }).check();
  await page.getByRole('button', { name: 'Guardar sistemas' }).click();
  await expect(page.getByRole('status')).toContainText('Sistemas guardados');
});

test('admin sees a conflict and can refresh before editing again', async ({ page }) => {
  await signInAs(page, 'PLATFORM_ADMIN');
  let changed = false;
  await page.route('**/api/v1/admin/customers**', async route => {
    if (route.request().method() === 'PATCH') {
      changed = true;
      await route.fulfill({ status: 409, json: { error: { code: 'PROFILE_REVISION_CONFLICT', message: 'Conflict' } } });
      return;
    }
    await route.fulfill({ json: { items: [{ ...customer, revision: changed ? 2 : 1 }], nextCursor: null } });
  });
  await page.goto('/admin/customers');
  await page.getByRole('button', { name: 'Editar sistemas de Cooperativa Exemplo' }).click();
  await page.getByRole('checkbox', { name: /ISO 14001/ }).check();
  await page.getByRole('button', { name: 'Guardar sistemas' }).click();
  await expect(page.getByRole('alert')).toContainText('alterado noutro local');
  await page.getByRole('button', { name: 'Atualizar lista' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('admin sees a useful list error and can retry', async ({ page }) => {
  await signInAs(page, 'PLATFORM_ADMIN');
  let attempts = 0;
  await page.route('**/api/v1/admin/customers**', async route => {
    attempts += 1;
    await route.fulfill(attempts === 1
      ? { status: 500, json: { error: { code: 'INTERNAL_ERROR', message: 'Error' } } }
      : { json: { items: [customer], nextCursor: null } });
  });
  await page.goto('/admin/customers');
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Cooperativa Exemplo' })).toBeVisible();
});
