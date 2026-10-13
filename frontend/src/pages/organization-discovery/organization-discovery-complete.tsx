import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { OrganizationDiscoveryState } from '@integra/shared/requirements';
import { Button } from '@/components/ui/button';
import { DiscoveryAnswers } from './discovery-answers';
import type { DiscoveryStep } from './discovery-summary';

export function OrganizationDiscoveryComplete({ state, onEdit }: { state: OrganizationDiscoveryState; onEdit: (step: DiscoveryStep) => void }) {
  const { t } = useTranslation('organizationDiscovery');
  return <div className="space-y-10">
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow flex items-center gap-2"><CheckCircle2 className="size-5" aria-hidden="true" />{t('title')}</p>
        <h1 className="text-3xl sm:text-4xl">{t('completeTitle')}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{t('completeIntro')}</p>
      </div>
      <div className="flex flex-wrap gap-4"><Button asChild size="lg"><Link className="w-full max-w-full flex-wrap sm:w-auto" to="/requirement4">{t('openGuide')}<ArrowRight aria-hidden="true" /></Link></Button><Button asChild variant="outline" size="lg"><Link className="w-full max-w-full flex-wrap sm:w-auto" to="/dashboard">{t('dashboard')}</Link></Button></div>
    </section>
    <DiscoveryAnswers discovery={state} onEdit={onEdit} />
  </div>;
}
