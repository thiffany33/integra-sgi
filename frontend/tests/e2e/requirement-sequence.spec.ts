import { expect, test } from '@playwright/test'

const profile = {
  schemaVersion: 1,
  organization: { name: 'Cooperativa Exemplo', nif: '123456789', sector: 'Serviços', email: 'contato@example.pt' },
  representative: { name: 'Maria Silva', email: '', phone: '' },
  selectedSystems: ['sgq', 'sga', 'sgsst'],
}
const user = { id: 'user-1', name: 'Maria Silva', email: 'contato@example.pt', locale: 'pt-PT', emailVerifiedAt: null }

const sequence = [
  ['/requirement7', 'Requisito 7 - Suporte'],
  ['/requirement7_1', '7.1 Recursos'],
  ['/requirement7_2', '7.2 Competência'],
  ['/requirement7_3', '7.3 Consciencialização'],
  ['/requirement7_4', '7.4 Comunicação'],
  ['/requirement7_5', '7.5 Informação Documentada'],
  ['/requirement8', 'Requisito 8 - Operação'],
  ['/requirement8_1', '8.1 Planeamento e Controlo Operacional'],
  ['/requirement8_2', '8.2 Requisitos para Produtos e Serviços e Preparação para Emergências'],
  ['/requirement8_4', '8.4 Controlo de Processos, Produtos e Serviços Fornecidos Externamente'],
] as const

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ json: { user, profile } }))
  await page.route('**/api/v1/customers/me', route => route.fulfill({ json: { profile, revision: 1, updatedAt: new Date().toISOString() } }))
})

test('os botões seguinte e anterior percorrem os capítulos 7 e 8 pela ordem certa', async ({ page }) => {
  const sequenceNav = page.getByRole('navigation', { name: 'Sequência do guia' })
  await page.goto(sequence[0][0])
  for (const [index, [path, title]] of sequence.entries()) {
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    const next = sequence[index + 1]
    if (next) await sequenceNav.getByRole('link', { name: /Continuar/ }).click()
  }
  await expect(sequenceNav.getByRole('link', { name: /Voltar ao guia de gestão/ })).toHaveAttribute('href', '/requirement')

  for (const [path, title] of [...sequence].reverse().slice(1)) {
    await sequenceNav.getByRole('link', { name: /Voltar/ }).first().click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  }
})

test('o 7.2 liga às funções do requisito 5.3 e oferece o plano de formação', async ({ page }) => {
  await page.goto('/requirement7_2')
  await page.getByRole('button', { name: 'Explicação do requisito' }).click()
  await expect(page.getByRole('link', { name: /Requisito 5.3/ })).toHaveAttribute('href', '/requirement5_3')
  await page.getByRole('button', { name: 'Ferramentas de apoio' }).click()
  await expect(page.getByRole('link', { name: 'Baixar Plano de formação' })).toHaveAttribute('href', 'http://localhost:3001/api/v1/files/templates/training-plan')
})

test('o capítulo 8 aparece no guia, na lista de capítulos e nos sub-requisitos', async ({ page }) => {
  await page.goto('/requirement')
  await expect(page.getByRole('heading', { name: 'Operação' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Começar requisito 8' })).toHaveAttribute('href', '/requirement8')
  await expect(page.getByText('cobrem os requisitos 4 a 8')).toBeVisible()
  await page.goto('/requirement8')
  await expect(page.getByRole('navigation', { name: 'Capítulos do guia' }).getByRole('link', { name: '8. Operação' })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'Sub-requisitos' }).click()
  for (const path of ['/requirement8_1', '/requirement8_2', '/requirement8_4']) {
    await expect(page.locator(`main a[href="${path}"]`).first()).toBeVisible()
  }
  await expect(page.locator('main a[download]')).toHaveCount(0)
})
