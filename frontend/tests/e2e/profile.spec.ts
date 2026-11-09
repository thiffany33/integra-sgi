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
  await page.route('**/api/v1/customers/me/avatar', route => route.fulfill({ json: { photoUrl: null } }));
});

test('carrega o perfil e guarda os dados da conta sem escrever no armazenamento do navegador', async ({ page }) => {
  await page.route('**/api/v1/auth/me', async route => {
    if (route.request().method() === 'PATCH') {
      expect(route.request().postDataJSON()).toEqual({ name: 'Maria Costa', email: 'maria@example.pt' });
      await route.fulfill({ json: { user: { ...user, name: 'Maria da Costa' } } });
      return;
    }
    await route.fulfill({ json: { user, profile } });
  });
  await page.goto('/profile/account');
  await expect(page.getByRole('heading', { level: 1, name: 'Dados pessoais' })).toBeVisible();
  await expect(page.getByLabel('Nome da conta')).toHaveValue('Maria Silva');
  await page.getByLabel('Nome da conta').fill('Maria Costa');
  await page.getByRole('button', { name: 'Guardar dados da conta' }).click();
  await expect(page.getByRole('status')).toContainText('Dados da conta guardados');
  await expect(page.getByLabel('Nome da conta')).toHaveValue('Maria da Costa');
  await expect(page.getByLabel('Email da conta')).toHaveValue('maria@example.pt');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, (window as Window & { profileStorageWrites: string[] }).profileStorageWrites.length])).toEqual([0, 0, 0]);
});

test('alterar o email da conta encerra a sessão até o novo endereço ser confirmado', async ({ page }) => {
  await page.route('**/api/v1/auth/me', async route => {
    if (route.request().method() === 'PATCH') {
      expect(route.request().postDataJSON()).toEqual({ name: 'Maria Silva', email: 'maria.costa@example.pt' });
      await route.fulfill({ json: { user: { ...user, email: 'maria.costa@example.pt' } } });
      return;
    }
    await route.fulfill({ json: { user, profile } });
  });
  await page.goto('/profile/account');
  await page.getByLabel('Email da conta').fill('Maria.Costa@Example.PT');
  await page.getByRole('button', { name: 'Guardar dados da conta' }).click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fprofile%2Faccount$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Aceda à sua conta' })).toBeVisible();
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
  await page.goto('/profile/account');
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
  await page.goto('/profile/organization');
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
  await page.goto('/profile/organization');
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
  await page.goto('/profile/security');
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

test('descarrega uma cópia dos dados da conta', async ({ page }) => {
  await page.route('**/api/v1/account/export', route => route.fulfill({ json: { schemaVersion: 1, account: { email: user.email } } }));
  await page.goto('/profile/security');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descarregar os meus dados' }).click();
  expect((await download).suggestedFilename()).toBe('integra-sgi-dados.json');
  await expect(page.getByText('O ficheiro foi descarregado.')).toBeVisible();
});

test('apagar a conta exige confirmação e a palavra-passe certa', async ({ page }) => {
  const attempts: unknown[] = [];
  await page.route('**/api/v1/account/delete', route => {
    attempts.push(route.request().postDataJSON());
    return attempts.length === 1
      ? route.fulfill({ status: 401, json: { error: { code: 'INVALID_CURRENT_PASSWORD' } } })
      : route.fulfill({ json: { message: 'Account deleted.' } });
  });
  await page.goto('/profile/security');
  await page.getByLabel('Palavra-passe, para confirmar').fill('wrong-password');
  await page.getByRole('button', { name: 'Apagar a conta definitivamente' }).click();
  await expect(page.getByText('Confirme que compreende que a conta será apagada')).toBeVisible();
  expect(attempts).toHaveLength(0);

  await page.getByRole('checkbox', { name: /Compreendo que a conta/ }).check();
  await page.getByRole('button', { name: 'Apagar a conta definitivamente' }).click();
  await expect(page.getByRole('alert')).toContainText('A palavra-passe atual');
  await expect(page).toHaveURL('/profile/security');

  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }));
  await page.getByLabel('Palavra-passe, para confirmar').fill('right-password');
  await page.getByRole('button', { name: 'Apagar a conta definitivamente' }).click();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('status')).toContainText('A sua conta e todos os dados associados foram apagados.');
  expect(attempts).toEqual([{ password: 'wrong-password' }, { password: 'right-password' }]);
});

test('conta de administração não mostra a secção dos seus dados', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ json: { user: { ...user, isAdmin: true }, profile } }));
  await page.goto('/profile/security');
  await expect(page.getByRole('button', { name: 'Alterar palavra-passe' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Os seus dados' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Descarregar os meus dados' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Apagar a conta definitivamente' })).toHaveCount(0);
});

test('a visão geral mostra cada área como texto e abre a página certa', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'O meu perfil' })).toBeVisible();
  await expect(page.getByText('maria@example.pt')).toBeVisible();
  await expect(page.getByRole('main').getByText('Cooperativa Exemplo')).toBeVisible();
  await expect(page.getByText('Gestão da Qualidade — ISO 9001')).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('link', { name: 'Editar organização' }).click();
  await expect(page).toHaveURL('/profile/organization');
  await expect(page.getByLabel('Nome da organização')).toHaveValue('Cooperativa Exemplo');
  await page.getByRole('link', { name: 'Voltar ao perfil' }).click();
  await expect(page).toHaveURL('/profile');
});

test('a conta de administração não tem a área da organização', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ json: { user: { ...user, isAdmin: true }, profile } }));
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Segurança da conta' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Organização' })).toHaveCount(0);
  await page.route('**/api/v1/admin/insights', route => route.fulfill({ status: 500, json: {} }));
  await page.goto('/profile/organization');
  await expect(page).toHaveURL('/admin/insights');
});

test('guarda as preferências de leitura na conta e aplica-as de imediato', async ({ page }) => {
  const saved: unknown[] = [];
  await page.route('**/api/v1/auth/me/reading-preferences', route => {
    saved.push(route.request().postDataJSON());
    return route.fulfill({ json: { user: { ...user, readingPreferences: route.request().postDataJSON() } } });
  });
  await page.goto('/profile/reading');
  await expect(page.getByRole('radio', { name: 'Normal' })).toBeChecked();
  await page.getByRole('radio', { name: 'Muito grande' }).check();
  await page.getByRole('checkbox', { name: /Contraste alto/ }).check();
  await page.getByRole('button', { name: 'Guardar preferências' }).click();
  await expect(page.getByRole('status')).toContainText('Preferências de leitura guardadas.');
  expect(saved).toEqual([{ textSize: 'larger', highContrast: true }]);
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'larger');
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe('20px');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('as preferências guardadas aplicam-se ao entrar e desaparecem ao sair', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ json: { user: { ...user, readingPreferences: { textSize: 'large', highContrast: false } }, profile } }));
  await page.goto('/profile');
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'large');
  await expect(page.locator('html')).not.toHaveAttribute('data-contrast', 'high');
  await expect(page.getByText('Grande', { exact: true })).toBeVisible();
  await page.route('**/api/v1/auth/logout', route => route.fulfill({ status: 204, body: '' }));
  await page.getByRole('button', { name: 'Menu da conta de Cooperativa Exemplo' }).click();
  await page.getByRole('menuitem', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('html')).not.toHaveAttribute('data-text-size', 'large');
});
