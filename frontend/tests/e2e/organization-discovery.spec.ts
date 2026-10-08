import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
  let failNextGet = false;
  let locale = 'pt-PT';
  let gets = 0;
  let releaseGet: (() => void) | null = null;
  let pendingGet: Promise<void> | null = null;
  const writes: Array<{ step: number; body: { revision: number; answers: Record<string, unknown> } }> = [];
  await page.route('**/api/v1/auth/me', route => route.fulfill({ json: { user: { ...user, locale }, profile } }));
  await page.route('**/api/v1/customers/me', route => route.fulfill({ json: { profile, revision: 1, updatedAt: new Date().toISOString() } }));
  await page.route('**/api/v1/guided-flows/organization-discovery**', async route => {
    const method = route.request().method();
    const url = route.request().url();
    if (method === 'GET') {
      gets += 1;
      if (pendingGet) { await pendingGet; pendingGet = null; }
      if (failNextGet) { failNextGet = false; return route.fulfill({ status: 503, json: { error: { code: 'UNAVAILABLE' } } }); }
      return route.fulfill({ json: state });
    }
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
  return {
    writes, getState: () => state, getCount: () => gets,
    failSave: () => { failNextSave = true; },
    failGet: () => { failNextGet = true; },
    holdGet: () => { pendingGet = new Promise<void>(resolve => { releaseGet = resolve; }); },
    releaseGet: () => { releaseGet?.(); releaseGet = null; },
    setState: (next: Flow) => { state = next; },
    setLocale: (value: string) => { locale = value; },
  };
}

test('anonymous visitors sign in before opening discovery', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }));
  await page.goto('/organization-discovery');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Forganization-discovery/);
});

test('discovery remains accessible by keyboard and at mobile width with 200% text', async ({ page }) => {
  await mockFlow(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/organization-discovery');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });

  async function checkScreen() {
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  }

  await checkScreen();
  await page.getByRole('button', { name: 'Começar' }).focus();
  await page.keyboard.press('Enter');
  for (let step = 1; step <= 5; step++) {
    await expect(page.getByText(`Passo ${step} de 6`)).toBeVisible();
    await checkScreen();
    await page.getByRole('button', { name: 'Continuar' }).focus();
    await page.keyboard.press('Enter');
  }
  await expect(page.getByRole('heading', { name: 'Rever respostas' })).toBeVisible();
  await checkScreen();
  await page.getByRole('button', { name: 'Confirmar descoberta' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Respostas guardadas' })).toBeVisible();
  await checkScreen();
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

test('shared header links save the current step before leaving', async ({ page }) => {
  const flow = await mockFlow(page);
  await page.goto('/organization-discovery');
  await page.getByRole('button', { name: 'Começar' }).click();
  await page.getByLabel('Localização principal').fill('Lisboa');
  await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Meu plano' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(flow.getState().responses['4.1'].primaryLocation).toBe('Lisboa');
  await page.goto('/organization-discovery');
  await expect(page.getByText('Passo 2 de 6')).toBeVisible();
  await page.getByLabel('Descreva a atividade principal').fill('Reparação de máquinas');
  await page.getByRole('button', { name: 'Menu da conta de Maria Silva' }).click();
  await page.getByRole('menuitem', { name: 'O meu perfil' }).click();
  await expect(page).toHaveURL(/\/profile$/);
  expect(flow.getState().responses['4.1'].activityDescription).toBe('Reparação de máquinas');
});

test('a failed save blocks header navigation and preserves the draft', async ({ page }) => {
  const flow = await mockFlow(page);
  await page.goto('/organization-discovery');
  await page.getByRole('button', { name: 'Começar' }).click();
  await page.getByLabel('Localização principal').fill('Braga');
  flow.failSave();
  await page.getByRole('link', { name: 'Integra SGI — página inicial' }).click();
  await expect(page).toHaveURL(/\/organization-discovery$/);
  await expect(page.getByRole('alert')).toContainText('Não foi possível guardar');
  await expect(page.getByLabel('Localização principal')).toHaveValue('Braga');
  expect(flow.writes).toHaveLength(0);
  await page.getByRole('link', { name: 'Integra SGI — página inicial' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(flow.getState().responses['4.1'].primaryLocation).toBe('Braga');
});

test('review keeps free-text answers literal when they match an option key', async ({ page }) => {
  await mockFlow(page);
  await page.goto('/organization-discovery');
  await page.getByRole('button', { name: 'Começar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Outra').first().check();
  for (let step = 2; step <= 4; step++) await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Quer acrescentar alguma nota?').fill('other');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rever respostas');
  const notes = page.getByText('Quer acrescentar alguma nota?').locator('..');
  await expect(notes.locator('dd')).toHaveText('other');
  await expect(page.getByText('Que atividades realiza?').first().locator('..').locator('dd')).toHaveText('Outra');
});

test('review preserves an additional person’s free-text role', async ({ page }) => {
  await mockFlow(page);
  await page.goto('/organization-discovery');
  await page.getByRole('button', { name: 'Começar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Responsável pela gestão').fill('Maria Silva');
  await page.getByRole('button', { name: 'Adicionar pessoa' }).click();
  await page.getByLabel('Nome', { exact: true }).fill('Ana Costa');
  await page.getByLabel('Função ou trabalho').fill('other');
  for (let step = 3; step <= 5; step++) await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rever respostas');
  const peopleCard = page.getByRole('heading', { name: 'Pessoas e responsabilidades', exact: true }).locator('..').locator('..');
  await expect(peopleCard.getByText('Ana Costa · other')).toBeVisible();
  await expect(peopleCard.getByText('Responsável pela gestão · Maria Silva')).toBeVisible();
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

test('dashboard starts discovery from saved not-started state and identifies selected systems as planned', async ({ page }) => {
  await mockFlow(page);
  await page.goto('/dashboard');
  await expect(page.getByRole('link', { name: 'Começar a descoberta' })).toHaveAttribute('href', '/organization-discovery');
  await expect(page.getByText('Incluído no plano')).toBeVisible();
  await expect(page.getByRole('main').getByText(/concluído/i)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Começar pelo requisito 4' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Consultar todo o guia' })).toBeVisible();
  const account = page.getByRole('button', { name: 'Menu da conta de Maria Silva' });
  await expect(account).toContainText('A minha conta');
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(account).toBeVisible();
  await account.click();
  await expect(page.getByRole('menuitem', { name: 'O meu perfil' })).toBeVisible();
});

test('dashboard resumes at the step returned by the saved discovery', async ({ page }) => {
  const flow = await mockFlow(page);
  flow.setState({ status: 'IN_PROGRESS', currentStep: 3, completedSteps: [1, 2], revision: 2, responses: { '4.1': { workforceRange: '10-49' } } });
  await page.goto('/dashboard');
  await expect(page.getByRole('link', { name: 'Retomar no passo 3 de 6' })).toHaveAttribute('href', '/organization-discovery');
  await expect(page.getByRole('main').getByText(/descoberta concluída/i)).toHaveCount(0);
  await page.getByRole('link', { name: 'Retomar no passo 3 de 6' }).click();
  await expect(page.getByText('Passo 3 de 6')).toBeVisible();
});

test('dashboard offers the next guide action after confirmed discovery', async ({ page }) => {
  const flow = await mockFlow(page);
  flow.setState({ status: 'COMPLETED', currentStep: 6, completedSteps: [1, 2, 3, 4, 5, 6], revision: 6, responses: {} });
  await page.goto('/dashboard');
  await expect(page.getByText('Descoberta concluída')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Abrir o guia do requisito 4' })).toHaveAttribute('href', '/requirement4');
  await expect(page.getByRole('link', { name: /Retomar no passo/ })).toHaveCount(0);
});

test('dashboard waits for saved progress and retries a failed load without showing guessed progress', async ({ page }) => {
  const flow = await mockFlow(page);
  flow.holdGet();
  await page.goto('/dashboard');
  await expect(page.getByRole('status')).toContainText('A carregar a descoberta');
  await expect(page.getByRole('link', { name: 'Começar a descoberta' })).toHaveCount(0);
  flow.failGet();
  flow.releaseGet();
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar');
  await expect(page.getByRole('link', { name: 'Começar a descoberta' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('link', { name: 'Começar a descoberta' })).toBeVisible();
  expect(flow.getCount()).toBe(2);
});

test('dashboard discovery action remains readable in every supported locale', async ({ page }) => {
  const flow = await mockFlow(page);
  for (const [locale, action, included, account] of [
    ['pt-PT', 'Começar a descoberta', 'Incluído no plano', 'A minha conta'],
    ['en', 'Start discovery', 'Included in the plan', 'My account'],
    ['fr', 'Commencer la découverte', 'Inclus dans le plan', 'Mon compte'],
    ['de', 'Erkundung beginnen', 'Im Plan enthalten', 'Mein Konto'],
  ]) {
    flow.setLocale(locale);
    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: action })).toBeVisible();
    await expect(page.getByText(included)).toBeVisible();
    await expect(page.getByText(account, { exact: true })).toBeVisible();
  }
});
