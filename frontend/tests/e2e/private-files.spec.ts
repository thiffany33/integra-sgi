import { expect, test } from '@playwright/test'

const profile = {
  schemaVersion: 1,
  organization: { name: 'Cooperativa Exemplo', nif: '123456789', sector: 'Serviços', email: 'contato@example.pt' },
  representative: { name: 'Maria Silva', email: '', phone: '' },
  selectedSystems: ['sgq'],
}
const user = { id: 'user-1', name: 'Maria Silva', email: 'contato@example.pt', locale: 'pt-PT', emailVerifiedAt: null }
const oldPublicPaths = [
  '/documents/requirement4/4_1/4_1_modelo_swot.xlsx',
  '/documents/requirement4/4_2/4_2_modelo_partes_interessadas.xlsx',
  '/documents/requirement4/4_3/4_3_modelo_ambito.docx',
  '/documents/requirement4/4_4/4_4_modelo_cadeia_de_valor.xlsx',
  '/documents/requirement4/4_4/4_4_modelo_fluxograma.xlsx',
  '/documents/requirement4/4_4/4_4_modelo_mapa_de_processos.xlsx',
  '/documents/requirement5/5_2/5_2_modelo_politica.docx',
  '/documents/requirement5/5_3/5_3_modelo_responsabilidades.xlsx',
  '/documents/requirement5/5_4/5_4_consulta_trabalhadores.pdf',
  '/documents/requirement5/5_4/5_4_proximos_passos.docx',
  '/documents/requirement6/6_1/6_1_modelo_aspetos_ambiental.xlsx',
  '/documents/requirement6/6_1/6_1_modelo_riscos_oportunidades.xlsx',
  '/documents/requirement6/6_2/6_2_modelo_objetivos.xlsx',
  '/documents/requirement7/7_1_modelo_controlo_documental.xlsx',
  '/documents/requirement7/7_3_modelo_plano_formacao.xlsx',
  '/documents/requirement7/7_5_modelo_controlo_documental.xlsx',
]

test('template links use the authenticated API and removed public URLs no longer serve files', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 200, json: { user, profile } }))
  await page.route('**/api/v1/customers/me', route => route.fulfill({ status: 200, json: { profile, revision: 1, updatedAt: new Date().toISOString() } }))
  await page.goto('/downloads')

  const links = page.getByRole('main').getByRole('link')
  await expect(links.first()).toHaveAttribute('href', /^http:\/\/localhost:3001\/api\/v1\/files\/templates\//)
  for (const path of oldPublicPaths) {
    const response = await page.evaluate(async url => {
      const result = await fetch(url)
      return { type: result.headers.get('content-type'), status: result.status }
    }, path)
    expect(response.status, path).toBe(200)
    expect(response.type, path).toContain('text/html')
  }
})

test('signed-out visitors cannot open the template library or a template API link', async ({ page }) => {
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: {} }))
  await page.goto('/downloads')
  await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('returnTo') === '/downloads')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aceda à sua conta')
})
