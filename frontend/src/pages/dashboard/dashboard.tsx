import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Download, Layers3, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OrganizationDiscoveryState } from '@integra/shared/requirements';
import { organizationDiscoveryApi } from '@/api/organization-discovery.api';
import { systemOptions } from '@/lib/systems';
import { useOnboarding } from '@/contexts/onboarding-state';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { t } = useTranslation(['home', 'onboarding']);
  const { systems } = useOnboarding();
  const selected = systemOptions.filter(item => systems[item.key]);
  const [discovery, setDiscovery] = useState<OrganizationDiscoveryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const initialRequest = useRef<Promise<OrganizationDiscoveryState> | null>(null);

  const retry = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    setDiscovery(null);
    try { setDiscovery(await organizationDiscoveryApi.get()); }
    catch { setLoadError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    initialRequest.current ??= organizationDiscoveryApi.get();
    initialRequest.current.then(saved => { if (active) setDiscovery(saved); })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <>
    <PageHeading eyebrow={t('home:dashboardEyebrow')} title={t('home:dashboardTitle')} description={t('home:dashboardDescription')} />
    <div className="space-y-8">
      <section aria-labelledby="discovery-title">
        <Card className="border-primary/20 bg-secondary/40 shadow-none">
          <CardHeader>
            <p className="eyebrow">{t('home:startHere')}</p>
            <h2 id="discovery-title">{t('home:discoveryTitle')}</h2>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? <p role="status" aria-live="polite">{t('home:discoveryLoading')}</p>
              : loadError ? <div role="alert" className="space-y-4"><p>{t('home:discoveryLoadError')}</p><Button variant="outline" onClick={() => void retry()}>{t('home:discoveryRetry')}</Button></div>
              : discovery?.status === 'COMPLETED' ? <>
                <p className="font-semibold text-secondary-foreground">{t('home:discoveryCompleted')}</p>
                <p className="max-w-2xl">{t('home:discoveryCompleteDescription')}</p>
                <Button asChild><Link to="/requirement4">{t('home:discoveryNextAction')}<ArrowRight aria-hidden="true" /></Link></Button>
              </> : discovery?.status === 'IN_PROGRESS' ? <>
                <p className="max-w-2xl">{t('home:discoveryInProgress')}</p>
                <Button asChild><Link to="/organization-discovery">{t('home:discoveryResume', { step: discovery.currentStep })}<ArrowRight aria-hidden="true" /></Link></Button>
              </> : discovery?.status === 'NOT_STARTED' ? <>
                <p className="max-w-2xl">{t('home:discoveryIntro')}</p>
                <Button asChild><Link to="/organization-discovery">{t('home:discoveryStart')}<ArrowRight aria-hidden="true" /></Link></Button>
              </> : null}
          </CardContent>
        </Card>
      </section>
      {selected.length ? <section aria-labelledby="selected-title">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 id="selected-title">{t('home:selectedAreas')}</h2><Button asChild variant="outline"><Link to="/profile"><SlidersHorizontal aria-hidden="true" />{t('home:viewProfile')}</Link></Button></div>
        <div className="grid gap-4 md:grid-cols-3">{selected.map(item => <Card key={item.key} className="shadow-none"><CardContent className="space-y-3"><Layers3 aria-hidden="true" className="size-6 text-secondary-foreground" /><h3>{t(item.key === 'sgq' ? 'onboarding:quality' : item.key === 'sga' ? 'onboarding:environment' : 'onboarding:safety')}</h3><div className="flex flex-wrap items-center gap-3"><Badge variant="secondary">{item.code}</Badge><span className="text-sm text-muted-foreground">{t('home:includedInPlan')}</span></div></CardContent></Card>)}</div>
        <Alert role="note" className="mt-6"><AlertDescription>{t('home:profileSavedNotice')} {t('home:systemsManagedNotice')}</AlertDescription></Alert>
      </section> : <Card className="max-w-2xl shadow-none"><CardHeader><h2>{t('home:guestPlan')}</h2><p>{t('home:guestDescription')}</p></CardHeader><CardContent><Button asChild><Link to="/select-systems">{t('home:chooseSystems')}<ArrowRight aria-hidden="true" /></Link></Button></CardContent></Card>}
      <div className="flex flex-wrap gap-4"><Button asChild variant="outline"><Link to="/requirement"><BookOpen aria-hidden="true" />{t('home:allGuide')}</Link></Button><Button asChild variant="outline"><Link to="/downloads"><Download aria-hidden="true" />{t('home:viewTemplates')}</Link></Button></div>
    </div>
  </>;
}
