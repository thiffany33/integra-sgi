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
    const writes: string[] = [];
    Object.defineProperty(window, 'profilePhotoStorageWrites', { value: writes });
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) { writes.push(key); return original.call(this, key, value); };
  });
  await page.route('**/api/v1/auth/me', route => route.fulfill({ json: { user, profile } }));
  await page.route('**/api/v1/customers/me', route => route.fulfill({ json: { profile, revision: 1, updatedAt: new Date().toISOString() } }));
  await page.route('**/api/v1/customers/me/avatar', route => route.fulfill({ json: { photoUrl: null } }));
});

test('uploads and previews a profile photo, replaces it, and removes it without browser storage', async ({ page }) => {
  const calls: string[] = [];
  await page.route('**/api/v1/customers/me/avatar', async route => {
    const method = route.request().method(); calls.push(method);
    if (method === 'GET') return route.fulfill({ json: { photoUrl: calls.length === 1 ? null : 'https://storage.example/avatar.png?signature=short' } });
    if (method === 'POST') return route.fulfill({ json: { photoUrl: `https://storage.example/avatar-${calls.filter(item => item === 'POST').length}.png?signature=short` } });
    if (method === 'DELETE') return route.fulfill({ status: 204 });
    return route.fallback();
  });

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Fotografia de perfil' })).toBeVisible();
  await page.getByLabel('Escolher fotografia de perfil').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from([137, 80, 78, 71]) });
  await expect(page.getByRole('img', { name: 'Fotografia de perfil' })).toHaveAttribute('src', /avatar-1\.png/);
  await page.getByLabel('Escolher fotografia de perfil').setInputFiles({ name: 'new-avatar.webp', mimeType: 'image/webp', buffer: Buffer.from('RIFF0000WEBP') });
  await expect(page.getByRole('img', { name: 'Fotografia de perfil' })).toHaveAttribute('src', /avatar-2\.png/);
  await page.getByRole('button', { name: 'Remover fotografia de perfil' }).click();
  await expect(page.getByRole('img', { name: 'Fotografia de perfil' })).toHaveCount(0);
  await expect.poll(() => calls.filter(method => method === 'POST')).toHaveLength(2);
  expect(calls.filter(method => method === 'DELETE')).toHaveLength(1);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, (window as Window & { profilePhotoStorageWrites: string[] }).profilePhotoStorageWrites.length])).toEqual([0, 0, 0]);
});

test('shows an accessible error when photo upload fails', async ({ page }) => {
  await page.route('**/api/v1/customers/me/avatar', async route => route.request().method() === 'POST'
    ? route.fulfill({ status: 400, json: { error: { code: 'INVALID_PROFILE_PHOTO', message: 'Invalid photo' } } })
    : route.fulfill({ json: { photoUrl: null } }));
  await page.goto('/profile');
  await page.getByLabel('Escolher fotografia de perfil').setInputFiles({ name: 'not-image.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') });
  await expect(page.getByRole('alert')).toContainText('Escolha uma imagem JPEG, PNG ou WebP até 5 MiB.');
});
