import { test, expect } from '@playwright/test'

const publicRoutes = [
  '/', '/register', '/representative', '/select-systems', '/requirement', '/contact', '/login', '/forgot-password', '/reset-password', '/verify-email',
]

const privateRoutes = [
  '/dashboard', '/profile', '/downloads',
  '/requirement4', '/requirement4_1', '/requirement4_2', '/requirement4_3', '/requirement4_4',
  '/requirement5', '/requirement5_1', '/requirement5_2', '/requirement5_3', '/requirement5_4',
  '/requirement6', '/requirement6_1_quality', '/requirement6_1_environment', '/requirement6_1_sst', '/requirement6_2',
  '/requirement7', '/requirement7_1', '/requirement7_2', '/requirement7_3', '/requirement7_4', '/requirement7_5',
]

const routes = [...publicRoutes, ...privateRoutes]

for (const route of publicRoutes) {
  test(`rota e links disponíveis: ${route}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('navigation', { name: 'Navegação principal', exact: true })).toBeVisible()
    const links = await page.locator('main a[href]').evaluateAll(elements => elements.map(element => element.getAttribute('href')!))
    for (const href of links) {
      if (href.startsWith('/documents/')) {
        const response = await page.request.get(href)
        expect(response.status(), href).toBe(200)
        expect(response.headers()['content-type'], href).not.toContain('text/html')
      } else if (href.startsWith('/')) {
        expect(routes, `Link interno em ${route}: ${href}`).toContain(new URL(href, 'http://localhost').pathname)
      }
    }
    expect(errors).toEqual([])
  })
}

for (const route of privateRoutes) {
  test(`rota privada exige conta: ${route}`, async ({ page }) => {
    await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }))
    await page.goto(route)
    await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('returnTo') === route)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aceda à sua conta')
  })
}

test('visitantes vêem só navegação pública e um resumo do guia', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }))
  await page.goto('/requirement')
  const nav = page.getByRole('navigation', { name: 'Navegação principal' })
  await expect(nav.getByRole('link', { name: 'Meu plano' })).toHaveCount(0)
  await expect(nav.getByRole('link', { name: 'Modelos' })).toHaveCount(0)
  await expect(nav.getByRole('link', { name: 'Entrar' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Criar conta' })).toBeVisible()
  await expect(page.getByRole('main').getByRole('link', { name: 'Entrar' })).toBeVisible()
})

test('escolhas temporárias não são gravadas no navegador antes de criar a conta', async ({ page }) => {
  await page.goto('/select-systems')
  await page.getByLabel('Crie uma palavra-passe').fill('correct-horse-battery')
  await page.getByRole('checkbox', { name: /Gestão da Qualidade/ }).uncheck()
  await expect(page.getByRole('button', { name: 'Criar conta e ver o meu plano' })).toBeEnabled()
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('registros visuais desktop e mobile', async ({ page }, testInfo) => {
  for (const [name, route, width] of [
    ['inicio-desktop', '/', 1440],
    ['cadastro-desktop', '/register', 1280],
    ['guia-desktop', '/requirement', 1280],
    ['inicio-mobile', '/', 375],
    ['sistemas-mobile', '/select-systems', 375],
  ] as const) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true })
  }
})
