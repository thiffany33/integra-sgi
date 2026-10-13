import type { TFunction } from 'i18next';

export type DiscoveryStep = 1 | 2 | 3 | 4 | 5;

export const discoverySections = [
  { step: 1, code: '4.1', title: 'step1Title', edit: 'editOrganization', fields: ['workforceRange', 'workLocation', 'primaryLocation', 'yearsInOperation'] },
  { step: 2, code: '4.1', title: 'step2Title', edit: 'editActivity', fields: ['activityTypes', 'customerTypes', 'operatingAreas', 'activityDescription'] },
  { step: 3, code: '4.2', title: 'step3Title', edit: 'editPeople', fields: ['responsibilityAssignments', 'additionalPeople'] },
  { step: 4, code: '4.4', title: 'step4Title', edit: 'editProcesses', fields: ['processes'] },
  { step: 5, code: '6.1', title: 'step5Title', edit: 'editAttention', fields: ['attentionTopics', 'notes'] },
] as const;

export const discoveryFieldLabels: Record<string, string> = {
  workforceRange: 'teamSize', workLocation: 'workLocation', primaryLocation: 'primaryLocation', yearsInOperation: 'yearsInOperation',
  activityTypes: 'activityTypes', customerTypes: 'customerTypes', operatingAreas: 'operatingAreas', activityDescription: 'activityDescription',
  responsibilityAssignments: 'step3Title', additionalPeople: 'additionalPeople', processes: 'step4Title', attentionTopics: 'attentionTopics', notes: 'notes',
};

const values: Record<string, string> = {
  '1-9': 'range1', '10-49': 'range2', '50-249': 'range3', '250+': 'range4',
  on_site: 'onSite', remote: 'remote', hybrid: 'hybrid', multiple_sites: 'multipleSites',
  services: 'services', production: 'production', trade: 'trade', construction: 'construction', other: 'other',
  consumers: 'consumers', businesses: 'businesses', public_sector: 'publicSector', local: 'local', national: 'national', international: 'international',
  sales: 'sales', purchasing: 'purchasing', service_delivery: 'serviceDelivery', customer_support: 'customerSupport', administration: 'administration',
  complaints: 'complaints', delays: 'delays', service_errors: 'serviceErrors', incidents: 'incidents', material_shortages: 'materialShortages', training_needs: 'trainingNeeds',
  management: 'responsibleManagement', quality: 'responsibleQuality', environment: 'responsibleEnvironment', safety: 'responsibleSafety',
  daily: 'daily', weekly: 'weekly', monthly: 'monthly', occasionally: 'occasionally',
};
const choiceFields = new Set(['workforceRange', 'workLocation', 'activityTypes', 'customerTypes', 'operatingAreas', 'attentionTopics', 'activity', 'frequency']);

/** Formats a saved answer for reading; `t` must use the organizationDiscovery namespace. */
export function formatDiscoveryAnswer(t: TFunction, value: unknown, field: string, parentField?: string): string {
  if (Array.isArray(value)) return value.length ? value.map(item => formatDiscoveryAnswer(t, item, field, parentField)).join(', ') : t('notProvided');
  if (value && typeof value === 'object') return Object.entries(value).filter(([, item]) => item !== undefined && item !== '').map(([key, item]) => formatDiscoveryAnswer(t, item, key, field)).join(' · ');
  if (value === undefined || value === '') return t('notProvided');
  if (typeof value === 'string' && (choiceFields.has(field) || (field === 'role' && parentField === 'responsibilityAssignments'))) return t(values[value] ?? value);
  return String(value);
}
