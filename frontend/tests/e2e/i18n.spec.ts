import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const locales = ['pt-PT', 'en', 'fr', 'de'] as const
const namespaces = ['common', 'navigation', 'auth', 'onboarding', 'home', 'profile', 'requirements', 'downloads', 'help'] as const
const catalogs = Object.fromEntries(locales.map(locale => [locale, Object.fromEntries(namespaces.map(namespace => [
  namespace,
  JSON.parse(readFileSync(resolve(fileURLToPath(new URL(`../../src/locales/${locale}/${namespace}.json`, import.meta.url))), 'utf8')) as Record<string, unknown>,
]))])) as Record<(typeof locales)[number], Record<(typeof namespaces)[number], Record<string, unknown>>>

test('all supported locale catalogs expose the same keys and exclude pt-BR', () => {
  expect(JSON.stringify(catalogs)).not.toContain('pt-BR')
  const baseline = catalogs['pt-PT']
  for (const locale of ['en', 'fr', 'de'] as const) {
    expect(Object.keys(catalogs[locale])).toEqual(Object.keys(baseline))
    for (const namespace of Object.keys(baseline) as Array<keyof typeof baseline>) {
      expect(Object.keys(catalogs[locale][namespace]).sort()).toEqual(Object.keys(baseline[namespace]).sort())
    }
  }
})

test('anonymous language selection follows runtime only and updates page language', async ({ page }) => {
  await page.goto('/requirement')
  await page.getByRole('button', { name: 'Idioma: Português (Portugal)' }).click()
  await expect(page.getByRole('menu')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.getByRole('menuitemradio', { name: 'Français' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.getByRole('heading', { name: 'Un pas à la fois.' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT')
})

test('authenticated language choice is saved on the account and restored from the API', async ({ page }) => {
  const profile = {
    schemaVersion: 1,
    organization: { name: 'Exemplo', nif: '123456789', sector: 'Serviços', email: 'contato@example.pt' },
    representative: { name: 'Maria Silva', email: '', phone: '' },
    selectedSystems: ['sgq'],
  }
  let user = { id: 'user-1', name: 'Maria Silva', email: 'contato@example.pt', locale: 'pt-PT', emailVerifiedAt: null }
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 200, json: { user, profile } }))
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }))
  await page.route('**/api/v1/auth/me/locale', async route => {
    const body = route.request().postDataJSON() as { locale: string }
    user = { ...user, locale: body.locale }
    await route.fulfill({ status: 200, json: { user } })
  })
  await page.goto('/dashboard')
  await page.getByRole('button', { name: 'Idioma: Português (Portugal)' }).click()
  await page.getByRole('menuitemradio', { name: 'Deutsch' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(page.getByRole('heading', { name: 'Ihre Managementbereiche' })).toBeVisible()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(page.getByRole('heading', { name: 'Ihre Managementbereiche' })).toBeVisible()
})
