import type { OrganizationDiscoveryState } from '@integra/shared/requirements';
import type { CustomerProfileInput } from '@integra/shared/profile';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const sections = [
  { step: 1, code: '4.1', title: 'step1Title', edit: 'editOrganization', fields: ['workforceRange', 'workLocation', 'primaryLocation', 'yearsInOperation'] },
  { step: 2, code: '4.1', title: 'step2Title', edit: 'editActivity', fields: ['activityTypes', 'customerTypes', 'operatingAreas', 'activityDescription'] },
  { step: 3, code: '4.2', title: 'step3Title', edit: 'editPeople', fields: ['responsibilityAssignments', 'additionalPeople'] },
  { step: 4, code: '4.4', title: 'step4Title', edit: 'editProcesses', fields: ['processes'] },
  { step: 5, code: '6.1', title: 'step5Title', edit: 'editAttention', fields: ['attentionTopics', 'notes'] },
] as const;

const labels: Record<string, string> = {
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

export function OrganizationDiscoveryReview({ state, profile, onEdit, onComplete, busy }: { state: OrganizationDiscoveryState; profile: CustomerProfileInput; onEdit: (step: 1 | 2 | 3 | 4 | 5) => void; onComplete: () => void; busy: boolean }) {
  const { t } = useTranslation('organizationDiscovery');
  const show = (value: unknown): string => {
    if (Array.isArray(value)) return value.length ? value.map(item => typeof item === 'string' ? t(values[item] ?? item) : Object.values(item as Record<string, unknown>).filter(Boolean).map(show).join(' · ')).join(', ') : t('notProvided');
    if (value === undefined || value === '') return t('notProvided');
    return t(values[String(value)] ?? String(value));
  };
  return <section className="mx-auto max-w-4xl space-y-8 py-6">
    <div className="space-y-3"><p className="eyebrow">{t('step', { number: 6 })}</p><h1>{t('reviewTitle')}</h1><p className="text-lg text-muted-foreground">{t('reviewIntro')}</p></div>
    <div className="grid gap-5 md:grid-cols-2">{sections.map(section => {
      const response = state.responses[section.code] as Record<string, unknown> | undefined;
      return <Card key={section.step} className="shadow-none"><CardHeader className="flex flex-row items-start justify-between gap-3"><h2>{t(section.title)}</h2><Button variant="outline" onClick={() => onEdit(section.step)}>{t(section.edit)}</Button></CardHeader><CardContent><dl className="space-y-3">{section.step === 1 && ([['organizationName', profile.organization.name], ['taxId', profile.organization.nif], ['sector', profile.organization.sector], ['contactEmail', profile.organization.email]] as const).map(([key, value]) => <div key={key}><dt className="text-base font-semibold">{t(key)}</dt><dd className="text-base text-muted-foreground">{value}</dd></div>)}{section.fields.map(field => <div key={field}><dt className="text-base font-semibold">{t(labels[field])}</dt><dd className="text-base text-muted-foreground">{show(response?.[field])}</dd></div>)}</dl></CardContent></Card>;
    })}</div>
    <Button size="lg" onClick={onComplete} disabled={busy}>{busy ? t('saving') : t('confirm')}</Button>
  </section>;
}
