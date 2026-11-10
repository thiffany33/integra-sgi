import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function signInForPrivatePages(page: import('@playwright/test').Page) {
  const profile = { schemaVersion: 1, organization: { name: 'Cooperativa Exemplo', nif: '123456789', sector: 'Serviços', email: 'contato@example.pt' }, representative: { name: 'Maria Silva', email: '', phone: '' }, selectedSystems: ['sgq'] }
  const user = { id: 'user-1', name: 'Maria Silva', email: 'contato@example.pt', locale: 'pt-PT', emailVerifiedAt: null }
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 200, json: { user, profile } }))
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }))
}

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
  await expect(page).toHaveURL(/\/verify-email\?email=contato%40atlantico\.pt$/)
  await expect(page.getByText('A conta foi criada. Consulte o email para confirmar o endereço antes de entrar.')).toBeVisible()
  expect(requests).toHaveLength(1)
  expect(requests[0]).toMatchObject({ email: 'contato@atlantico.pt', name: 'Cooperativa Atlântico', locale: 'pt-PT' })
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
  await signInForPrivatePages(page)
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver o meu perfil' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('leitura do requisito e link privado do modelo funcionam com teclado', async ({ page }) => {
  await signInForPrivatePages(page)
  await page.goto('/requirement4_1')
  const trigger = page.getByRole('button', { name: 'Ferramentas de apoio', exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const download = page.getByRole('link', { name: /SWOT/i })
  await expect(download).toBeVisible()
  await expect(download).toHaveAttribute('href', /^http:\/\/localhost:3001\/api\/v1\/files\/templates\/swot-analysis$/)

  // PDFs would otherwise replace the app: the signed storage URL is cross-origin, so `download` is ignored.
  await expect(download).toHaveAttribute('target', '_blank')
  await expect(download).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(download).toHaveAccessibleName(/abre num novo separador/)
})

for (const route of ['/', '/register', '/select-systems', '/dashboard', '/requirement4_1', '/downloads', '/contact', '/privacidade', '/login', '/nao-existe']) {
  test(`acessibilidade e leitura mobile em ${route}`, async ({ page }) => {
    if (['/dashboard', '/requirement4_1', '/downloads'].includes(route)) await signInForPrivatePages(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations).toEqual([])
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
    await page.evaluate(() => document.documentElement.style.fontSize = '200%')
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  })
}

test('o rodapé identifica a titular dos direitos', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('contentinfo')).toContainText(`© ${new Date().getFullYear()} Thiffany Gonçalves. Todos os direitos reservados.`)
})

test('o rodapé leva à política de privacidade', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('contentinfo').getByRole('link', { name: 'Política de privacidade' }).click()
  await expect(page).toHaveURL('/privacidade')
  await expect(page.getByRole('heading', { level: 1, name: 'Política de Privacidade' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '10. Os seus direitos' })).toBeVisible()
  await expect(page.getByRole('main')).toContainText('Email de contacto: thiffanyg33@gmail.com')
  await expect(page.getByRole('main')).not.toContainText('{{')
  await expect(page.getByRole('main')).toContainText('O registo de segurança não inclui o endereço IP.')
  await expect(page.getByRole('main')).toContainText('Até 1 hora; apagados automaticamente na limpeza seguinte, a cada 15 minutos')
})

test('formulário de contacto envia a mensagem e confirma o envio', async ({ page }) => {
  const sent: unknown[] = []
  await page.route('**/api/v1/contact', route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { available: true } })
    sent.push(route.request().postDataJSON())
    return route.fulfill({ status: 202, json: { message: 'Message sent.' } })
  })
  await page.goto('/contact')
  await page.getByLabel('Nome', { exact: true }).fill('Ana Silva')
  await page.getByLabel('Email', { exact: true }).fill('ana@example.pt')
  await page.getByLabel('Como podemos ajudar?').fill('Gostaria de saber mais sobre a ISO 9001.')
  await page.getByRole('button', { name: 'Enviar mensagem' }).click()
  await expect(page.getByRole('status')).toContainText('Mensagem enviada')
  expect(sent).toEqual([{ name: 'Ana Silva', email: 'ana@example.pt', message: 'Gostaria de saber mais sobre a ISO 9001.' }])
})

test('formulário de contacto explica limites e indisponibilidade', async ({ page }) => {
  let available = true
  await page.route('**/api/v1/contact', route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { available } })
    return route.fulfill({ status: 429, json: { error: { code: 'RATE_LIMITED' } } })
  })
  await page.goto('/contact')
  await page.getByLabel('Nome', { exact: true }).fill('Ana Silva')
  await page.getByLabel('Email', { exact: true }).fill('ana@example.pt')
  await page.getByLabel('Como podemos ajudar?').fill('Gostaria de saber mais sobre a ISO 9001.')
  await page.getByRole('button', { name: 'Enviar mensagem' }).click()
  await expect(page.getByRole('alert')).toContainText('Enviou várias mensagens seguidas')

  available = false
  await page.reload()
  await expect(page.getByText('Envio de mensagens indisponível')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Envio indisponível no momento' })).toBeDisabled()
})
