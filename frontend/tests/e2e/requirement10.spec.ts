import { expect, test } from '@playwright/test'

const profile = {
  schemaVersion: 1,
  organization: { name: 'Cooperativa Exemplo', nif: '123456789', sector: 'Serviços', email: 'contato@example.pt' },
  representative: { name: 'Maria Silva', email: '', phone: '' },
  selectedSystems: ['sgq', 'sga', 'sgsst'],
}
const user = { id: 'user-1', name: 'Maria Silva', email: 'contato@example.pt', locale: 'pt-PT', emailVerifiedAt: null }

test('requisito 10 apresenta orientações, modelos, referências e navegação sequencial', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 200, json: { user, profile } }))
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }))

  await page.goto('/requirement9_3')
  await page.getByRole('link', { name: /Requisito 10 - Melhoria/ }).click()
  await expect(page.getByRole('heading', { name: 'Requisito 10 - Melhoria' })).toBeVisible()
  await page.getByRole('button', { name: 'Sub-requisitos' }).click()
  await expect(page.getByRole('link', { name: '10.1 Generalidades', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '10.2 Não conformidade e ação corretiva', exact: true })).toBeVisible()

  await page.getByRole('link', { name: '10.1 Generalidades', exact: true }).click()
  await expect(page.getByRole('heading', { name: '10.1 Generalidades' })).toBeVisible()
  await page.getByRole('button', { name: 'Como identificar oportunidades?' }).click()
  await expect(page.getByText(/resultados da avaliação do desempenho/i)).toBeVisible()
  await page.getByRole('button', { name: 'Ferramentas de apoio' }).click()
  await expect(page.getByRole('link', { name: /Lista de ocorrências/ })).toHaveAttribute('href', /files\/templates\/occurrence-register/)

  await page.getByRole('link', { name: /Continuar.*10\.2 Não conformidade/ }).click()
  await expect(page.getByRole('heading', { name: '10.2 Não conformidade e ação corretiva' })).toBeVisible()
  await page.getByRole('button', { name: 'Ferramentas de apoio' }).click()
  await expect(page.getByRole('link', { name: /Relatório de acidente de trabalho/ })).toHaveAttribute('href', /files\/templates\/work-accident-report/)
  await page.getByRole('button', { name: 'Referência Oficial' }).click()
  await expect(page.getByRole('link', { name: /NP EN ISO 45001/ })).toHaveAttribute('href', /^https:\/\/www\.ipq\.pt\/loja\/normas\/norma\//)
  await expect(page.getByText('Confirme também as obrigações legais aplicáveis com a entidade competente.')).toBeVisible()
  await expect(page.getByRole('link', { name: /Voltar ao guia de gestão/ })).toHaveAttribute('href', '/requirement')
})

test('capítulo 10 aparece no índice do guia e os modelos estão na biblioteca de downloads', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 200, json: { user, profile } }))
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }))

  await page.goto('/requirement')
  await expect(page.getByRole('heading', { name: 'Melhoria' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Começar requisito 10' })).toHaveAttribute('href', '/requirement10')

  await page.goto('/downloads')
  const chapter10 = page.getByRole('region', { name: 'Requisito 10' })
  await expect(chapter10.getByRole('link', { name: /Lista de ocorrências e ações de melhoria/ })).toHaveAttribute('href', /files\/templates\/occurrence-register/)
  await expect(chapter10.getByRole('link', { name: /Relatório de acidente de trabalho/ })).toHaveAttribute('href', /files\/templates\/work-accident-report/)
})
