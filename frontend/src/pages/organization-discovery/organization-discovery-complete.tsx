import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function OrganizationDiscoveryComplete() {
  const { t } = useTranslation('organizationDiscovery');
  return <section className="mx-auto max-w-3xl space-y-8 py-8 sm:py-12">
    <CheckCircle2 className="size-16 text-secondary-foreground" aria-hidden="true" />
    <div className="space-y-4"><h1>{t('completeTitle')}</h1><p className="text-lg text-muted-foreground">{t('completeIntro')}</p></div>
    <div className="flex flex-wrap gap-4"><Button asChild size="lg"><Link className="w-full max-w-full flex-wrap sm:w-auto" to="/requirement4">{t('openGuide')}<ArrowRight aria-hidden="true" /></Link></Button><Button asChild variant="outline" size="lg"><Link className="w-full max-w-full flex-wrap sm:w-auto" to="/dashboard">{t('dashboard')}</Link></Button></div>
  </section>;
}
