// Editions in force in the IPQ catalogue (https://www.ipq.pt/loja/normas/), checked on 2026-11-11.
// IPQ sells the standards, so its catalogue entry is the most specific public page for each one.
export const STANDARDS = {
  iso9001: { reference: 'NP EN ISO 9001:2026', title: 'Sistemas de gestão da qualidade', url: 'https://www.ipq.pt/loja/normas/norma/79339d85-29c6-f111-aaad-000d3ad7c99f' },
  iso14001: { reference: 'NP EN ISO 14001:2026', title: 'Sistemas de gestão ambiental', url: 'https://www.ipq.pt/loja/normas/norma/7bf81020-5950-f111-bec7-7ced8d752c3d' },
  iso45001: { reference: 'NP EN ISO 45001:2023', title: 'Sistemas de gestão da segurança e saúde no trabalho', url: 'https://www.ipq.pt/loja/normas/norma/9eeb5608-2c6c-ee11-9ae7-000d3adf770b' },
  iso22000: { reference: 'NP EN ISO 22000:2023', title: 'Sistemas de gestão da segurança dos alimentos', url: 'https://www.ipq.pt/loja/normas/norma/bf4cc050-58f3-ed11-8849-000d3adcf54b' },
} as const;

export type StandardId = keyof typeof STANDARDS;

export const INTEGRATED_STANDARDS: StandardId[] = ['iso9001', 'iso14001', 'iso45001'];
