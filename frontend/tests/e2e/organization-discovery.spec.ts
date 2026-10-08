import { expect, test, type Page } from '@playwright/test';

const profile = {
  schemaVersion: 1,
  organization: { name: 'Cooperativa Exemplo', nif: '123456789', sector: 'Serviços', email: 'contacto@example.pt' },
  representative: { name: 'Maria Silva', email: '', phone: '' },
  selectedSystems: ['sgq'],
};
const user = { id: 'user-1', name: 'Maria Silva', email: 'maria@example.pt', locale: 'pt-PT', emailVerifiedAt: null };
type Flow = { status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'; currentStep: number; completedSteps: number[]; revision: number; responses: Record<string, Record<string, unknown>> };

async function mockFlow(page: Page) {
  let state: Flow = { status: 'NOT_STARTED', currentStep: 1, completedSteps: [], revision: 0, responses: {} };
  let failNextSave = false;
  let locale = 'pt-PT';
  let gets = 0;
  const writes: Array<{ step: number; body: { revision: number; answers: Record<string, unknown> } }> = [];
  await page.route('**/api/v1/auth/me', route => route.fulfill({ json: { user: { ...user, locale }, profile } }));
  await page.route('**/api/v1/customers/me', route => route.fulfill({ json: { profile, revision: 1, updatedAt: new Date().toISOString() } }));
  await page.route('**/api/v1/guided-flows/organization-discovery**', route => {
    const method = route.request().method();
    const url = route.request().url();
    if (method === 'GET') { gets += 1; return route.fulfill({ json: state }); }
    if (failNextSave) {
      failNextSave = false;
      return route.fulfill({ status: 503, json: { error: { code: 'UNAVAILABLE' } } });
    }
    const body = route.request().postDataJSON();
    if (body.revision !== state.revision) return route.fulfill({ status: 409, json: { error: { code: 'GUIDED_FLOW_REVISION_CONFLICT' } } });
    if (url.endsWith('/complete')) {
      state = { ...state, status: 'COMPLETED', currentStep: 6, completedSteps: [1, 2, 3, 4, 5, 6], revision: state.revision + 1 };
    } else {
      const step = Number(url.match(/steps\/(\d+)/)?.[1]);
      writes.push({ step, body });
      const requirement = ['4.1', '4.1', '4.2', '4.4', '6.1'][step - 1];
      const completedSteps = [...new Set([...state.completedSteps, step])].sort();
      state = { status: 'IN_PROGRESS', currentStep: [1, 2, 3, 4, 5].find(candidate => !completedSteps.includes(candidate)) ?? 6, completedSteps, revision: state.revision + 1, responses: { ...state.responses, [requirement]: { ...state.responses[requirement], ...body.answers } } };
    }
    return route.fulfill({ json: state });
  });
  return { writes, getState: () => state, getCount: () => gets, failSave: () => { failNextSave = true; }, setLocale: (value: string) => { locale = value; } };
}

test('anonymous visitors sign in before opening discovery', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }));
  await page.goto('/organization-discovery');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Forganization-discovery/);
});

test('starts, saves five groups, reviews and completes without storing answers in the browser', async ({ page }) => {
  const flow = await mockFlow(page);
  await page.goto('/organization-discovery');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Conhecer a organização');
  expect(flow.getCount()).toBe(1);
  await page.getByRole('button', { name: 'Começar' }).click();
  await expect(page.getByText('Cooperativa Exemplo')).toBeVisible();
  await page.getByLabel('Dimensão da equipa').selectOption('10-49');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Passo 2 de 6')).toBeVisible();
  expect(flow.writes[0]).toEqual({ step: 1, body: { revision: 0, answers: { workforceRange: '10-49' } } });
  await page.getByLabel('Serviços', { exact: true }).check();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Responsável pela gestão').fill('Maria Silva');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Vendas').check();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Atrasos').check();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Rever respostas');
  await expect(page.getByText('Cooperativa Exemplo')).toBeVisible();
  expect(flow.writes.map(write => write.step)).toEqual([1, 2, 3, 4, 5]);
  expect(JSON.stringify(flow.getState().responses)).not.toContain('Cooperativa Exemplo');
  await page.getByRole('button', { name: 'Confirmar descoberta' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Respostas guardadas');
  await expect(page.getByText(/preparar o sistema de gestão/i)).toBeVisible();
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('resumes from saved state, edits review, and does not advance on a failed save', async ({ page }) => {
  const flow = await mockFlow(page);
  await page.goto('/organization-discovery');
  await page.getByRole('button', { name: 'Começar' }).click();
  await page.getByLabel('Dimensão da equipa').selectOption('1-9');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.reload();
  await expect(page.getByText('Passo 2 de 6')).toBeVisible();
  flow.failSave();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível guardar');
  await expect(page.getByText('Passo 2 de 6')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (let step = 3; step <= 5; step++) await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Editar organização' }).click();
  await page.getByLabel('Dimensão da equipa').selectOption('50-249');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Rever respostas');
  expect(flow.getState().responses['4.1'].workforceRange).toBe('50-249');
});

test('back and save-and-leave persist the current answers before navigation', async ({ page }) => {
  const flow = await mockFlow(page);
  await page.goto('/organization-discovery');
  await page.getByRole('button', { name: 'Começar' }).click();
  await page.getByLabel('Dimensão da equipa').selectOption('1-9');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Serviços', { exact: true }).check();
  await page.getByRole('button', { name: 'Voltar' }).click();
  await expect(page.getByLabel('Dimensão da equipa')).toHaveValue('1-9');
  expect(flow.writes.map(write => write.step)).toEqual([1, 2]);
  await page.getByLabel('Localização principal').fill('Porto');
  await page.getByRole('button', { name: 'Guardar e sair' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(flow.getState().responses['4.1'].primaryLocation).toBe('Porto');
  await page.goto('/organization-discovery');
  await expect(page.getByText('Passo 3 de 6')).toBeVisible();
});

test('a reload restores only answers saved on the backend', async ({ page }) => {
  await mockFlow(page);
  await page.goto('/organization-discovery');
  await page.getByRole('button', { name: 'Começar' }).click();
  await page.getByLabel('Dimensão da equipa').selectOption('10-49');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Começar' })).toBeVisible();
  await page.getByRole('button', { name: 'Começar' }).click();
  await expect(page.getByLabel('Dimensão da equipa')).toHaveValue('');
});

test('all language catalogs render the discovery introduction', async ({ page }) => {
  const flow = await mockFlow(page);
  for (const [locale, heading, start, stepHeading] of [
    ['pt-PT', 'Conhecer a organização', 'Começar', 'A sua organização'],
    ['en', 'Get to know your organization', 'Start', 'Your organization'],
    ['fr', 'Découvrir votre organisation', 'Commencer', 'Votre organisation'],
    ['de', 'Ihre Organisation kennenlernen', 'Beginnen', 'Ihre Organisation'],
  ]) {
    flow.setLocale(locale);
    await page.goto('/organization-discovery');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    await page.getByRole('button', { name: start }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(stepHeading);
  }
});
