import { expect, test } from '@playwright/test';

const profile = {
  schemaVersion: 1,
  organization: { name: 'Cooperativa Exemplo', nif: '123456789', sector: 'Serviços', email: 'contacto@example.pt' },
  representative: { name: 'Maria Silva', email: '', phone: '' },
  selectedSystems: ['sgq'],
};
const user = { id: 'user-1', name: 'Maria Silva', email: 'maria@example.pt', locale: 'pt-PT', emailVerifiedAt: null };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const browserWindow = window as Window & { profileStorageWrites: string[] };
    browserWindow.profileStorageWrites = [];
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      browserWindow.profileStorageWrites.push(key);
      return original.call(this, key, value);
    };
  });
  await page.route('**/api/v1/auth/me', route => route.fulfill({ json: { user, profile } }));
  await page.route('**/api/v1/customers/me', route => route.fulfill({ json: { profile, revision: 1, updatedAt: new Date().toISOString() } }));
});

test('carrega o perfil e guarda os dados da conta sem escrever no armazenamento do navegador', async ({ page }) => {
  await page.route('**/api/v1/auth/me', async route => {
    if (route.request().method() === 'PATCH') {
      expect(route.request().postDataJSON()).toEqual({ name: 'Maria Costa', email: 'maria.costa@example.pt' });
      await route.fulfill({ json: { user: { ...user, name: 'Maria da Costa', email: 'maria.costa@example.pt' } } });
      return;
    }
    await route.fulfill({ json: { user, profile } });
  });
  await page.goto('/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'O meu perfil' })).toBeVisible();
  await expect(page.getByLabel('Nome da conta')).toHaveValue('Maria Silva');
  await page.getByLabel('Nome da conta').fill('Maria Costa');
  await page.getByLabel('Email da conta').fill('Maria.Costa@Example.PT');
  await page.getByRole('button', { name: 'Guardar dados da conta' }).click();
  await expect(page.getByRole('status')).toContainText('Dados da conta guardados');
  await expect(page.getByLabel('Nome da conta')).toHaveValue('Maria da Costa');
  await expect(page.getByLabel('Email da conta')).toHaveValue('maria.costa@example.pt');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, (window as Window & { profileStorageWrites: string[] }).profileStorageWrites.length])).toEqual([0, 0, 0]);
});

test('mostra uma mensagem clara quando o email da conta já está em uso', async ({ page }) => {
  await page.route('**/api/v1/auth/me', async route => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ status: 409, json: { error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Conflict' } } });
      return;
    }
    await route.fulfill({ json: { user, profile } });
  });
  await page.goto('/profile');
  await page.getByLabel('Email da conta').fill('outra@example.pt');
  await page.getByRole('button', { name: 'Guardar dados da conta' }).click();
  await expect(page.getByRole('alert')).toContainText('email já está associado a outra conta');
});

test('edita a organização sem permitir alterar os sistemas escolhidos', async ({ page }) => {
  await page.route('**/api/v1/customers/me', async route => {
    if (route.request().method() === 'PUT') {
      const payload = route.request().postDataJSON();
      expect(payload.revision).toBe(1);
      expect(payload.profile.organization.name).toBe('Nova Cooperativa');
      expect(payload.profile.selectedSystems).toBeUndefined();
      await route.fulfill({ json: { profile: { ...profile, organization: { ...payload.profile.organization, name: 'Cooperativa Nova validada' } }, revision: 2, updatedAt: new Date().toISOString() } });
      return;
    }
    await route.fulfill({ json: { profile, revision: 1, updatedAt: new Date().toISOString() } });
  });
  await page.goto('/profile');
  await page.getByLabel('Nome da organização').fill('Nova Cooperativa');
  await page.getByRole('button', { name: 'Guardar organização' }).click();
  await expect(page.getByRole('status')).toContainText('Organização guardada');
  await expect(page.getByLabel('Nome da organização')).toHaveValue('Cooperativa Nova validada');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, (window as Window & { profileStorageWrites: string[] }).profileStorageWrites.length])).toEqual([0, 0, 0]);
});

test('explica o conflito quando a organização foi alterada noutro local', async ({ page }) => {
  let conflict = false;
  await page.route('**/api/v1/customers/me', async route => {
    if (route.request().method() === 'PUT') {
      conflict = true;
      await route.fulfill({ status: 409, json: { error: { code: 'PROFILE_REVISION_CONFLICT', message: 'Conflict' } } });
      return;
    }
    await route.fulfill({ json: { profile: conflict ? { ...profile, organization: { ...profile.organization, name: 'Nome atualizado noutro local' } } : profile, revision: conflict ? 2 : 1, updatedAt: new Date().toISOString() } });
  });
  await page.goto('/profile');
  await page.getByLabel('Nome da organização').fill('Nova Cooperativa');
  await page.getByRole('button', { name: 'Guardar organização' }).click();
  await expect(page.getByRole('alert')).toContainText('alterado noutro local');
  await page.getByRole('button', { name: 'Recarregar perfil' }).click();
  await expect(page.getByLabel('Nome da organização')).toHaveValue('Nome atualizado noutro local');
});

test('valida e altera a palavra-passe, apresentando o erro de credenciais atuais', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/v1/auth/me/password', async route => {
    attempts += 1;
    expect(route.request().postDataJSON()).toEqual({ currentPassword: 'old-password-123', newPassword: 'new-password-123' });
    await route.fulfill(attempts === 1
      ? { status: 401, json: { error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Incorrect' } } }
      : { json: { user } });
  });
  await page.goto('/profile');
  await page.getByLabel('Palavra-passe atual').fill('old-password-123');
  await page.getByLabel('Nova palavra-passe').fill('short');
  await page.getByRole('button', { name: 'Alterar palavra-passe' }).click();
  await expect(page.getByLabel('Nova palavra-passe')).toHaveJSProperty('validity.valid', false);
  await page.getByLabel('Nova palavra-passe').fill('new-password-123');
  await page.getByRole('button', { name: 'Alterar palavra-passe' }).click();
  await expect(page.getByRole('alert')).toContainText('palavra-passe atual está incorreta');
  await page.getByRole('button', { name: 'Alterar palavra-passe' }).click();
  await expect(page.getByRole('status')).toContainText('Palavra-passe alterada');
  await expect(page.getByLabel('Nova palavra-passe')).toBeEmpty();
});
