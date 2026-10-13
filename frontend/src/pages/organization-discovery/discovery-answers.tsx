import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OrganizationDiscoveryState } from '@integra/shared/requirements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { discoveryFieldLabels, discoverySections, formatDiscoveryAnswer, type DiscoveryStep } from './discovery-summary';

/** Saved answers grouped by step. Edits open in place with `onEdit`, otherwise through a link to the discovery page. */
export function DiscoveryAnswers({ discovery, onEdit }: { discovery: OrganizationDiscoveryState; onEdit?: (step: DiscoveryStep) => void }) {
  const { t } = useTranslation('home');
  const { t: tDiscovery } = useTranslation('organizationDiscovery');
  return <section aria-labelledby="answers-title" className="space-y-4">
    <div className="space-y-2"><h2 id="answers-title">{t('answersTitle')}</h2><p className="max-w-2xl text-muted-foreground">{t('answersIntro')}</p></div>
    <div className="grid gap-5 md:grid-cols-2">{discoverySections.map(section => {
      const response = discovery.responses[section.code] as Record<string, unknown> | undefined;
      const label = <><Pencil aria-hidden="true" />{tDiscovery(section.edit)}</>;
      return <Card key={section.step} className="min-w-0 shadow-none">
        <CardHeader className="flex flex-wrap items-start justify-between gap-3"><h3>{tDiscovery(section.title)}</h3>
          {onEdit
            ? <Button variant="outline" className="min-w-0 max-w-full" onClick={() => onEdit(section.step)}>{label}</Button>
            : <Button asChild variant="outline" className="min-w-0 max-w-full"><Link to={`/organization-discovery?step=${section.step}`}>{label}</Link></Button>}
        </CardHeader>
        <CardContent><dl className="space-y-3 [overflow-wrap:anywhere]">{section.fields.map(field => <div key={field}><dt className="text-base font-semibold">{tDiscovery(discoveryFieldLabels[field])}</dt><dd className="text-base text-muted-foreground">{formatDiscoveryAnswer(tDiscovery, response?.[field], field)}</dd></div>)}</dl></CardContent>
      </Card>;
    })}</div>
  </section>;
}
