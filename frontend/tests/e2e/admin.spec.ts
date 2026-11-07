import { expect, test, type Page } from '@playwright/test';

const customer = {
  userId: 'customer-1', name: 'Maria Silva', email: 'maria@example.pt', organizationName: 'Cooperativa Exemplo',
  selectedSystems: ['sgq'], revision: 1, updatedAt: '2026-10-04T12:00:00.000Z',
};

async function signInAs(page: Page, role: 'CUSTOMER' | 'ADMIN') {
  const user = { id: role === 'CUSTOMER' ? 'customer-1' : 'admin-1', name: 'Utilizador', email: 'user@example.pt', locale: 'pt-PT', emailVerifiedAt: null, isAdmin: role === 'ADMIN' };
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
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Gerir empresas' })).toHaveCount(0);
});

test('admin can search for an identified account and explicitly save selected systems', async ({ page }) => {
  await signInAs(page, 'ADMIN');
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
  await signInAs(page, 'ADMIN');
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
  await signInAs(page, 'ADMIN');
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

test('retry after a failed new search uses the failed query and replaces the displayed list', async ({ page }) => {
  await signInAs(page, 'ADMIN');
  const queries: string[] = [];
  const matched = { ...customer, userId: 'customer-2', name: 'Ana Costa', organizationName: 'Cooperativa Nova' };
  await page.route('**/api/v1/admin/customers**', async route => {
    const query = new URL(route.request().url()).searchParams.get('search') ?? '';
    queries.push(query);
    if (query === 'Ana' && queries.filter(value => value === 'Ana').length === 1) {
      await route.fulfill({ status: 500, json: { error: { code: 'INTERNAL_ERROR', message: 'Error' } } });
      return;
    }
    await route.fulfill({ json: { items: query === 'Ana' ? [matched] : [customer], nextCursor: null } });
  });
  await page.goto('/admin/customers');
  await expect(page.getByRole('heading', { name: 'Cooperativa Exemplo' })).toBeVisible();
  await page.getByLabel('Procurar por nome ou email').fill('Ana');
  await page.getByRole('button', { name: 'Procurar' }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Cooperativa Nova' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cooperativa Exemplo' })).toHaveCount(0);
  expect(queries).toEqual(['', 'Ana', 'Ana']);
});

test('pending save keeps account and search controls stable', async ({ page }) => {
  await signInAs(page, 'ADMIN');
  const second = { ...customer, userId: 'customer-2', organizationName: 'Outra Empresa', email: 'outra@example.pt' };
  let releaseSave!: () => void;
  const savePending = new Promise<void>(resolve => { releaseSave = resolve; });
  await page.route('**/api/v1/admin/customers**', async route => {
    if (route.request().method() === 'PATCH') {
      await savePending;
      await route.fulfill({ json: { ...customer, selectedSystems: ['sgq', 'sga'], revision: 2 } });
      return;
    }
    await route.fulfill({ json: { items: [customer, second], nextCursor: 'next-page' } });
  });
  await page.goto('/admin/customers');
  await page.getByRole('button', { name: 'Editar sistemas de Cooperativa Exemplo' }).click();
  await page.getByRole('checkbox', { name: /ISO 14001/ }).check();
  await page.getByRole('button', { name: 'Guardar sistemas' }).click();
  await expect(page.getByRole('button', { name: 'A guardar…' })).toBeDisabled();
  await expect(page.getByLabel('Procurar por nome ou email')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Procurar' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Atualizar lista' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Ver mais empresas' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Editar sistemas de Outra Empresa' })).toBeDisabled();
  releaseSave();
  await expect(page.getByRole('status')).toContainText('Sistemas guardados');
});

test('a list response started before a save cannot replace the saved revision', async ({ page }) => {
  await signInAs(page, 'ADMIN');
  let listCalls = 0;
  let patchCalls = 0;
  let releaseList!: () => void;
  const listPending = new Promise<void>(resolve => { releaseList = resolve; });
  await page.route('**/api/v1/admin/customers**', async route => {
    if (route.request().method() === 'PATCH') {
      patchCalls += 1;
      expect(route.request().postDataJSON().revision).toBe(patchCalls);
      await route.fulfill({ json: { ...customer, selectedSystems: ['sgq', 'sga'], revision: 2 } });
      return;
    }
    listCalls += 1;
    if (listCalls === 2) await listPending;
    await route.fulfill({ json: { items: [customer], nextCursor: null } });
  });
  await page.goto('/admin/customers');
  await page.getByRole('button', { name: 'Editar sistemas de Cooperativa Exemplo' }).click();
  await page.getByRole('button', { name: 'Atualizar lista' }).click();
  await page.getByRole('checkbox', { name: /ISO 14001/ }).check();
  await page.getByRole('button', { name: 'Guardar sistemas' }).click();
  await expect(page.getByRole('status')).toContainText('Sistemas guardados');
  const staleResponse = page.waitForResponse(response => response.request().method() === 'GET' && response.url().includes('/admin/customers'));
  releaseList();
  await staleResponse;
  await expect(page.getByText('ISO 9001, ISO 14001')).toBeVisible();
  await page.getByRole('button', { name: 'Editar sistemas de Cooperativa Exemplo' }).click();
  await page.getByRole('checkbox', { name: /ISO 14001/ }).uncheck();
  await page.getByRole('button', { name: 'Guardar sistemas' }).click();
  await expect.poll(() => patchCalls).toBe(2);
});

test('a cancelled search cannot change the query used to paginate the displayed list', async ({ page }) => {
  await signInAs(page, 'ADMIN');
  let releaseSearch!: () => void;
  const searchPending = new Promise<void>(resolve => { releaseSearch = resolve; });
  let paginatedQuery: URLSearchParams | null = null;
  await page.route('**/api/v1/admin/customers**', async route => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ json: { ...customer, selectedSystems: ['sgq', 'sga'], revision: 2 } });
      return;
    }
    const params = new URL(route.request().url()).searchParams;
    if (params.get('cursor') === 'cursor-old') {
      paginatedQuery = params;
      await route.fulfill({ json: { items: [], nextCursor: null } });
    } else if (params.get('search') === 'Maria') {
      await searchPending;
      await route.fulfill({ json: { items: [], nextCursor: null } });
    } else {
      await route.fulfill({ json: { items: [customer], nextCursor: 'cursor-old' } });
    }
  });
  await page.goto('/admin/customers');
  await page.getByRole('button', { name: 'Editar sistemas de Cooperativa Exemplo' }).click();
  await page.getByLabel('Procurar por nome ou email').fill('Maria');
  await page.getByRole('button', { name: 'Procurar' }).click();
  await page.getByRole('checkbox', { name: /ISO 14001/ }).check();
  await page.getByRole('button', { name: 'Guardar sistemas' }).click();
  await expect(page.getByRole('status')).toContainText('Sistemas guardados');
  releaseSearch();
  await page.getByRole('button', { name: 'Ver mais empresas' }).click();
  await expect.poll(() => paginatedQuery?.get('cursor')).toBe('cursor-old');
  expect(paginatedQuery?.has('search')).toBe(false);
});

const insights = {
  generatedAt: '2026-11-07T12:00:00.000Z',
  funnel: { registered: 10, emailVerified: 8, discoveryStarted: 6, discoveryCompleted: 3 },
  stoppedAtStep: [{ value: '1', count: 0 }, { value: '2', count: 2 }, { value: '3', count: 1 }, { value: '4', count: 0 }, { value: '5', count: 0 }],
  registrationsByMonth: Array.from({ length: 12 }, (_, index) => ({ value: `${index < 2 ? 2025 : 2026}-${String(((index + 10) % 12) + 1).padStart(2, '0')}`, count: index === 11 ? 4 : 0 })),
  answered: { organization: 4, activity: 4, processes: 2, attention: 2 },
  selectedSystems: [{ value: 'sgq', count: 9 }, { value: 'sga', count: 4 }, { value: 'sgsst', count: 2 }],
  sectors: [{ value: 'Serviços', count: 6 }, { value: 'Indústria', count: 4 }],
  workforceRanges: [{ value: '1-9', count: 3 }, { value: '10-49', count: 1 }, { value: '50-249', count: 0 }, { value: '250+', count: 0 }],
  activityTypes: [{ value: 'services', count: 4 }],
  customerTypes: [{ value: 'businesses', count: 3 }],
  operatingAreas: [{ value: 'national', count: 2 }],
  processActivities: [{ value: 'sales', count: 2 }],
  attentionTopics: [{ value: 'delays', count: 2 }],
};

test('admin sees aggregated insights with readable counts and shares', async ({ page }) => {
  await signInAs(page, 'ADMIN');
  await page.route('**/api/v1/admin/insights', route => route.fulfill({ json: insights }));
  await page.goto('/admin/insights');
  await expect(page.getByRole('heading', { level: 1, name: 'Indicadores' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Diagnóstico concluído' })).toContainText('30% das contas');
  await expect(page.getByRole('listitem').filter({ hasText: 'Gestão da Qualidade' })).toContainText('9 · 90%');
  await expect(page.getByRole('listitem').filter({ hasText: 'Atividade e contexto' })).toContainText('2 · 67%');
  await expect(page.getByRole('listitem', { name: /: 4 contas$/ })).toHaveCount(1);
});

test('insights explain a failed load and can retry', async ({ page }) => {
  await signInAs(page, 'ADMIN');
  let calls = 0;
  await page.route('**/api/v1/admin/insights', route => (++calls === 1 ? route.fulfill({ status: 500, json: {} }) : route.fulfill({ json: insights })));
  await page.goto('/admin/insights');
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar os indicadores');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByText('Contas criadas')).toBeVisible();
});

test('customer cannot open the insights page', async ({ page }) => {
  await signInAs(page, 'CUSTOMER');
  await page.goto('/admin/insights');
  await expect(page).toHaveURL('/dashboard');
});

test('admin navigation only offers the administration pages, insights first', async ({ page }) => {
  await signInAs(page, 'ADMIN');
  await page.route('**/api/v1/admin/insights', route => route.fulfill({ json: insights }));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page).toHaveURL('/admin/insights');
  const navigation = page.getByRole('navigation', { name: 'Navegação principal', exact: true });
  await expect(navigation.getByRole('link')).toHaveText(['Indicadores', 'Empresas']);
});

test('admin signing in lands on the insights page', async ({ page }) => {
  const user = { id: 'admin-1', name: 'Utilizador', email: 'user@example.pt', locale: 'pt-PT', emailVerifiedAt: '2026-11-07T00:00:00.000Z', isAdmin: true };
  const profile = {
    schemaVersion: 1, organization: { name: 'Integra SGI', nif: 'N/A', sector: 'Administração da plataforma', email: 'user@example.pt' },
    representative: { name: 'Utilizador', email: '', phone: '' }, selectedSystems: ['sgq'],
  };
  let signedIn = false;
  await page.route('**/api/v1/auth/me', route => signedIn ? route.fulfill({ json: { user, profile } }) : route.fulfill({ status: 401, json: {} }));
  await page.route('**/api/v1/auth/login', route => { signedIn = true; return route.fulfill({ json: { user, profile } }); });
  await page.route('**/api/v1/customers/me', route => route.fulfill({ json: { profile, revision: 1, updatedAt: customer.updatedAt } }));
  await page.route('**/api/v1/admin/insights', route => route.fulfill({ json: insights }));
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.pt');
  await page.getByLabel('Palavra-passe').fill('correct-horse-battery');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL('/admin/insights');
});

test('customer navigation has no administration pages', async ({ page }) => {
  await signInAs(page, 'CUSTOMER');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/dashboard');
  const navigation = page.getByRole('navigation', { name: 'Navegação principal', exact: true });
  await expect(navigation.getByRole('link', { name: 'Meu plano' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Indicadores' })).toHaveCount(0);
});

test('admin downloads a company\'s data', async ({ page }) => {
  await signInAs(page, 'ADMIN');
  await page.route('**/api/v1/admin/customers**', route => route.fulfill({ json: { items: [customer], nextCursor: null } }));
  await page.route('**/api/v1/admin/customers/customer-1/export', route => route.fulfill({ json: { schemaVersion: 1, account: { email: customer.email } } }));
  await page.goto('/admin/customers');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descarregar dados de Cooperativa Exemplo' }).click();
  expect((await download).suggestedFilename()).toBe('integra-sgi-dados-customer-1.json');
  await expect(page.getByRole('status')).toContainText('Os dados de Cooperativa Exemplo foram descarregados.');
});

test('admin deletes a company only after confirming with their own password', async ({ page }) => {
  await signInAs(page, 'ADMIN');
  const attempts: unknown[] = [];
  await page.route('**/api/v1/admin/customers**', route => route.fulfill({ json: { items: [customer], nextCursor: null } }));
  await page.route('**/api/v1/admin/customers/customer-1/delete', route => {
    attempts.push(route.request().postDataJSON());
    return attempts.length === 1
      ? route.fulfill({ status: 401, json: { error: { code: 'INVALID_CURRENT_PASSWORD' } } })
      : route.fulfill({ json: { message: 'Customer deleted.' } });
  });
  await page.goto('/admin/customers');
  await page.getByRole('button', { name: 'Apagar conta de Cooperativa Exemplo' }).click();
  await expect(page.getByText('Apaga de imediato a conta de maria@example.pt')).toBeVisible();
  await page.getByLabel('A sua palavra-passe, para confirmar').fill('wrong-password');
  await page.getByRole('button', { name: 'Apagar definitivamente' }).click();
  await expect(page.getByRole('alert')).toContainText('Confirme que compreende');
  expect(attempts).toHaveLength(0);

  await page.getByRole('checkbox', { name: /Compreendo que a conta de Cooperativa Exemplo/ }).check();
  await page.getByRole('button', { name: 'Apagar definitivamente' }).click();
  await expect(page.getByRole('alert')).toContainText('A sua palavra-passe está incorreta.');
  await expect(page.getByRole('heading', { name: 'Cooperativa Exemplo', exact: true })).toBeVisible();

  await page.getByLabel('A sua palavra-passe, para confirmar').fill('right-password');
  await page.getByRole('button', { name: 'Apagar definitivamente' }).click();
  await expect(page.getByRole('status')).toContainText('A conta de Cooperativa Exemplo foi apagada.');
  await expect(page.getByRole('heading', { name: 'Cooperativa Exemplo', exact: true })).toHaveCount(0);
  expect(attempts).toEqual([{ password: 'wrong-password' }, { password: 'right-password' }]);
});

test('admin opening a customer page by URL goes to the indicators', async ({ page }) => {
  await signInAs(page, 'ADMIN');
  await page.route('**/api/v1/admin/insights', route => route.fulfill({ status: 500, json: {} }));
  for (const path of ['/dashboard', '/organization-discovery', '/downloads', '/requirement4_1']) {
    await page.goto(path);
    await expect(page).toHaveURL('/admin/insights');
  }
  await page.goto('/profile');
  await expect(page).toHaveURL('/profile');
});
