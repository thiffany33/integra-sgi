import type { OrganizationDiscoveryState } from '@integra/shared/requirements';
import type { CustomerProfileInput } from '@integra/shared/profile';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { discoveryFieldLabels, discoverySections, formatDiscoveryAnswer, type DiscoveryStep } from './discovery-summary';

export function OrganizationDiscoveryReview({ state, profile, onEdit, onComplete, busy }: { state: OrganizationDiscoveryState; profile: CustomerProfileInput; onEdit: (step: DiscoveryStep) => void; onComplete: () => void; busy: boolean }) {
  const { t } = useTranslation('organizationDiscovery');
  return <section className="mx-auto max-w-4xl space-y-8 py-6">
    <div className="space-y-3"><p className="eyebrow">{t('step', { number: 6 })}</p><h1>{t('reviewTitle')}</h1><p className="text-lg text-muted-foreground">{t('reviewIntro')}</p></div>
    <div className="grid gap-5 md:grid-cols-2">{discoverySections.map(section => {
      const response = state.responses[section.code] as Record<string, unknown> | undefined;
      return <Card key={section.step} className="min-w-0 shadow-none"><CardHeader className="flex flex-wrap items-start justify-between gap-3"><h2>{t(section.title)}</h2><Button variant="outline" className="min-w-0 max-w-full" onClick={() => onEdit(section.step)}>{t(section.edit)}</Button></CardHeader><CardContent><dl className="space-y-3 [overflow-wrap:anywhere]">{section.step === 1 && ([['organizationName', profile.organization.name], ['taxId', profile.organization.nif], ['sector', profile.organization.sector], ['contactEmail', profile.organization.email]] as const).map(([key, value]) => <div key={key}><dt className="text-base font-semibold">{t(key)}</dt><dd className="text-base text-muted-foreground">{value}</dd></div>)}{section.fields.map(field => <div key={field}><dt className="text-base font-semibold">{t(discoveryFieldLabels[field])}</dt><dd className="text-base text-muted-foreground">{formatDiscoveryAnswer(t, response?.[field], field)}</dd></div>)}</dl></CardContent></Card>;
    })}</div>
    <Button size="lg" className="max-w-full" onClick={onComplete} disabled={busy}>{busy ? t('saving') : t('confirm')}</Button>
  </section>;
}
