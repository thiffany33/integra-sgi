import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('navegação por teclado permite pular para o conteúdo', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Ir para o conteúdo' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('cadastro mantém campos ao voltar e orienta o próximo passo', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('Nome da organização').fill('Cooperativa Exemplo')
  await page.getByLabel('NIF').fill('123456789')
  await page.getByLabel('Ramo de atividade').selectOption('Serviços')
  await page.getByLabel('Email principal').fill('empresa@example.com')
  await page.getByRole('button', { name: 'Continuar para representante' }).click()
  await expect(page).toHaveURL(/representative/)
  await page.getByLabel('Nome do representante').fill('Maria Silva')
  await page.getByRole('link', { name: 'Voltar para organização' }).click()
  await expect(page.getByLabel('Nome da organização')).toHaveValue('Cooperativa Exemplo')
  await page.getByRole('button', { name: 'Continuar para representante' }).click()
  await expect(page.getByLabel('Nome do representante')).toHaveValue('Maria Silva')
})

test('cadastro grava o perfil selecionado pela API sem usar storage do navegador', async ({ page }) => {
  const requests: Record<string, unknown>[] = []
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }))
  await page.route('**/api/v1/auth/register', route => {
    const body = route.request().postDataJSON() as Record<string, unknown>
    requests.push(body)
    route.fulfill({ status: 201, json: { user: { id: 'created-1', name: body.name, email: body.email, locale: body.locale, emailVerifiedAt: null }, profile: body.profile } })
  })
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile: requests[0]?.profile, revision: 1, updatedAt: new Date().toISOString() } }))
  await page.goto('/register')
  await page.getByLabel('Nome da organização').fill('Cooperativa Atlântico')
  await page.getByLabel('NIF').fill('123456789')
  await page.getByLabel('Ramo de atividade').selectOption('Serviços')
  await page.getByLabel('Email principal').fill('contato@atlantico.pt')
  await page.getByRole('button', { name: 'Continuar para representante' }).click()
  await page.getByLabel('Nome do representante').fill('Maria Silva')
  await page.getByRole('button', { name: 'Continuar para sistemas' }).click()
  await page.getByRole('checkbox', { name: /Gestão Ambiental/ }).uncheck()
  await page.getByRole('checkbox', { name: /Segurança e Saúde no Trabalho/ }).uncheck()
  await page.getByLabel('Crie uma palavra-passe').fill('correct-horse-battery')
  await page.getByRole('button', { name: 'Criar conta e ver o meu plano' }).click()
  await expect(page).toHaveURL(/dashboard/)
  expect(requests).toHaveLength(1)
  expect(requests[0]).toMatchObject({ email: 'contato@atlantico.pt', name: 'Maria Silva', locale: 'pt-PT' })
  expect(requests[0].profile).toMatchObject({
    organization: { name: 'Cooperativa Atlântico', nif: '123456789' },
    representative: { name: 'Maria Silva' },
    selectedSystems: ['sgq'],
  })
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('seleção exige um sistema antes de permitir criar a conta', async ({ page }) => {
  await page.goto('/select-systems')
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.uncheck()
  await expect(page.getByRole('button', { name: 'Criar conta e ver o meu plano' })).toBeDisabled()
  await expect(page.getByText('Selecione pelo menos um sistema para continuar.')).toBeVisible()
  await page.getByRole('checkbox', { name: /Gestão da Qualidade/ }).check()
  await expect(page.getByRole('button', { name: 'Criar conta e ver o meu plano' })).toBeEnabled()
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('painel continua utilizável sem carregar ou gravar estado em armazenamento do navegador', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Alterar escolha' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('leitura do requisito e download funcionam com teclado', async ({ page }) => {
  await page.goto('/requirement4_1')
  const trigger = page.getByRole('button', { name: 'Ferramentas de apoio', exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const download = page.getByRole('link', { name: /SWOT/i })
  await expect(download).toBeVisible()
  const response = await page.request.get((await download.getAttribute('href'))!)
  expect(response.ok()).toBeTruthy()
  expect(response.headers()['content-type']).not.toContain('text/html')
})

for (const route of ['/', '/register', '/select-systems', '/dashboard', '/requirement4_1', '/downloads', '/contact', '/login', '/nao-existe']) {
  test(`acessibilidade e leitura mobile em ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
    await page.evaluate(() => document.documentElement.style.fontSize = '200%')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  })
}
