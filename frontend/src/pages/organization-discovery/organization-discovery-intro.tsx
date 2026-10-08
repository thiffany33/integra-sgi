import { ArrowRight, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function OrganizationDiscoveryIntro({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation('organizationDiscovery');
  return <section className="mx-auto max-w-3xl space-y-8 py-8 sm:py-12">
    <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><ClipboardList className="size-8" aria-hidden="true" /></div>
    <div className="space-y-5"><h1>{t('title')}</h1><p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{t('intro')}</p></div>
    <Button size="lg" onClick={onStart}>{t('start')}<ArrowRight aria-hidden="true" /></Button>
  </section>;
}
