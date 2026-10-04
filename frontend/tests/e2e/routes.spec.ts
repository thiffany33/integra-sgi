import { test, expect } from '@playwright/test'

const routes = [
  '/', '/register', '/representative', '/select-systems', '/dashboard', '/requirement', '/downloads', '/contact', '/login', '/forgot-password', '/reset-password', '/verify-email',
  '/requirement4', '/requirement4_1', '/requirement4_2', '/requirement4_3', '/requirement4_4',
  '/requirement5', '/requirement5_1', '/requirement5_2', '/requirement5_3', '/requirement5_4',
  '/requirement6', '/requirement6_1_quality', '/requirement6_1_environment', '/requirement6_1_sst', '/requirement6_2',
  '/requirement7', '/requirement7_1', '/requirement7_2', '/requirement7_3', '/requirement7_4', '/requirement7_5',
]

for (const route of routes) {
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
    ['requisito-desktop', '/requirement4_1', 1280],
    ['inicio-mobile', '/', 375],
    ['sistemas-mobile', '/select-systems', 375],
  ] as const) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true })
  }
})
