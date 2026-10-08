import { expect, test } from '@playwright/test'

const profile = {
  schemaVersion: 1,
  organization: { name: 'Cooperativa Exemplo', nif: '123456789', sector: 'Serviços', email: 'contato@example.pt' },
  representative: { name: 'Maria Silva', email: '', phone: '' },
  selectedSystems: ['sgq'],
}
const user = { id: 'user-1', name: 'Maria Silva', email: 'contato@example.pt', locale: 'pt-PT', emailVerifiedAt: null }

const translations = {
  'pt-PT': ['Guia de consulta dos trabalhadores', 'Próximos passos da participação'],
  en: ['Worker consultation guide', 'Next steps for participation'],
  fr: ['Guide de consultation des travailleurs', 'Prochaines étapes de la participation'],
  de: ['Leitfaden zur Mitarbeiterkonsultation', 'Nächste Schritte zur Beteiligung'],
} as const

test('requisitos 5.4 e 7.1 apresentam os modelos privados nos quatro idiomas', async ({ browser }) => {
  for (const [locale, labels] of Object.entries(translations)) {
    const context = await browser.newContext({ locale })
    const page = await context.newPage()
    await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 200, json: { user: { ...user, locale }, profile } }))
    await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }))

    await page.goto('/requirement5_4')
    const toolsTitle = { 'pt-PT': 'Ferramentas de apoio', en: 'Supporting tools', fr: 'Outils d’accompagnement', de: 'Unterstützende Hilfsmittel' }[locale as keyof typeof translations]
    await page.getByRole('button', { name: toolsTitle }).click()
    const workerLink = page.getByRole('link', { name: labels[0] })
    const participationLink = page.getByRole('link', { name: labels[1] })
    await expect(workerLink).toHaveAttribute('href', 'http://localhost:3001/api/v1/files/templates/worker-consultation')
    await expect(participationLink).toHaveAttribute('href', 'http://localhost:3001/api/v1/files/templates/participation-next-steps')

    await page.goto('/requirement7_1')
    await expect(page.getByRole('heading', { name: {
      'pt-PT': '7.1 Recursos', en: '7.1 Resources', fr: '7.1 Ressources', de: '7.1 Ressourcen',
    }[locale as keyof typeof translations] })).toBeVisible()
    await page.getByRole('button', { name: toolsTitle }).click()
    const resourcesLink = page.getByRole('link', { name: {
      'pt-PT': 'Recursos para controlo documental',
      en: 'Document control resources',
      fr: 'Ressources de maîtrise documentaire',
      de: 'Ressourcen zur Dokumentenlenkung',
    }[locale as keyof typeof translations] })
    await expect(resourcesLink).toHaveAttribute('href', 'http://localhost:3001/api/v1/files/templates/document-control-resources')

    await context.close()
  }
})
