import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Download, LifeBuoy, Layers3, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OrganizationDiscoveryState } from '@integra/shared/requirements';
import { organizationDiscoveryApi } from '@/api/organization-discovery.api';
import { systemOptions } from '@/lib/systems';
import { useOnboarding } from '@/contexts/onboarding-state';
import { useAuth } from '@/contexts/auth-context-value';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DiscoveryAnswers } from '@/pages/organization-discovery/discovery-answers';

const savedGroups = (discovery: OrganizationDiscoveryState) => discovery.completedSteps.filter(step => step <= 5).length;

function DiscoveryProgress({ discovery }: { discovery: OrganizationDiscoveryState }) {
  const { t } = useTranslation('home');
  const saved = savedGroups(discovery);
  return <div className="space-y-2">
    <p className="text-base font-semibold">{t('progressLabel', { saved })}</p>
    <div className="h-3 max-w-xl overflow-hidden rounded-full bg-background" role="progressbar" aria-valuenow={saved} aria-valuemin={0} aria-valuemax={5} aria-label={t('progressLabel', { saved })}><div className="h-full rounded-full bg-primary" style={{ width: `${saved / 5 * 100}%` }} /></div>
  </div>;
}

function DiscoveryMetrics({ discovery }: { discovery: OrganizationDiscoveryState }) {
  const { t } = useTranslation('home');
  const people = discovery.responses['4.2'];
  const metrics = [
    ['metricGroups', t('metricOutOf', { value: savedGroups(discovery), total: 5 })],
    ['metricPeople', String((people?.responsibilityAssignments?.length ?? 0) + (people?.additionalPeople?.length ?? 0))],
    ['metricActivities', String(discovery.responses['4.4']?.processes?.length ?? 0)],
    ['metricTopics', String(discovery.responses['6.1']?.attentionTopics?.length ?? 0)],
  ] as const;
  return <section aria-labelledby="summary-title" className="space-y-4">
    <h2 id="summary-title">{t('summaryTitle')}</h2>
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="flex flex-col-reverse gap-2 rounded-xl border bg-card p-5 text-card-foreground"><dt className="text-base text-muted-foreground">{t(label)}</dt><dd className="text-3xl font-bold">{value}</dd></div>)}</dl>
    <p className="field-hint">{t('metricsNote')}</p>
  </section>;
}

export default function Dashboard() {
  const { t } = useTranslation(['home', 'onboarding', 'navigation']);
  const { systems } = useOnboarding();
  const auth = useAuth();
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

  const started = discovery && discovery.status !== 'NOT_STARTED';

  return <>
    <header className="mb-8 space-y-2">
      <p className="eyebrow">{t('home:dashboardEyebrow')}</p>
      <h1 className="text-3xl sm:text-4xl">{auth.status === 'authenticated' ? t('home:dashboardGreeting', { name: auth.user.name.trim().split(/\s+/)[0] }) : t('home:dashboardTitle')}</h1>
      <p className="max-w-2xl text-lg text-muted-foreground">{t('home:dashboardSummary')}</p>
    </header>
    <div className="space-y-10">
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
                <Button asChild size="lg"><Link to="/requirement4">{t('home:discoveryNextAction')}<ArrowRight aria-hidden="true" /></Link></Button>
              </> : discovery?.status === 'IN_PROGRESS' ? <>
                <p className="max-w-2xl">{t('home:discoveryInProgress')}</p>
                <DiscoveryProgress discovery={discovery} />
                <Button asChild size="lg"><Link to="/organization-discovery">{t('home:discoveryResume', { step: discovery.currentStep })}<ArrowRight aria-hidden="true" /></Link></Button>
              </> : discovery?.status === 'NOT_STARTED' ? <>
                <p className="max-w-2xl">{t('home:discoveryIntro')}</p>
                <Button asChild size="lg"><Link to="/organization-discovery">{t('home:discoveryStart')}<ArrowRight aria-hidden="true" /></Link></Button>
              </> : null}
          </CardContent>
        </Card>
      </section>
      {started && <DiscoveryMetrics discovery={discovery} />}
      {started && <DiscoveryAnswers discovery={discovery} />}
      {selected.length ? <section aria-labelledby="selected-title">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 id="selected-title">{t('home:selectedAreas')}</h2><Button asChild variant="outline"><Link to="/profile"><SlidersHorizontal aria-hidden="true" />{t('home:viewProfile')}</Link></Button></div>
        <div className="grid gap-4 md:grid-cols-3">{selected.map(item => <Card key={item.key} className="shadow-none"><CardContent className="space-y-3"><Layers3 aria-hidden="true" className="size-6 text-secondary-foreground" /><h3>{t(item.key === 'sgq' ? 'onboarding:quality' : item.key === 'sga' ? 'onboarding:environment' : 'onboarding:safety')}</h3><div className="flex flex-wrap items-center gap-3"><Badge variant="secondary">{item.code}</Badge><span className="text-sm text-muted-foreground">{t('home:includedInPlan')}</span></div></CardContent></Card>)}</div>
        <Alert role="note" className="mt-6"><AlertDescription>{t('home:profileSavedNotice')} {t('home:systemsManagedNotice')}</AlertDescription></Alert>
      </section> : <Card className="max-w-2xl shadow-none"><CardHeader><h2>{t('home:guestPlan')}</h2><p>{t('home:guestDescription')}</p></CardHeader><CardContent><Button asChild><Link to="/select-systems">{t('home:chooseSystems')}<ArrowRight aria-hidden="true" /></Link></Button></CardContent></Card>}
      <section aria-labelledby="shortcuts-title" className="space-y-4">
        <h2 id="shortcuts-title">{t('home:shortcutsTitle')}</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="outline"><Link to="/requirement4"><BookOpen aria-hidden="true" />{t('home:shortcutRequirement4')}</Link></Button>
          <Button asChild variant="outline"><Link to="/requirement"><BookOpen aria-hidden="true" />{t('home:allGuide')}</Link></Button>
          <Button asChild variant="outline"><Link to="/downloads"><Download aria-hidden="true" />{t('home:viewTemplates')}</Link></Button>
          <Button asChild variant="outline"><Link to="/contact"><LifeBuoy aria-hidden="true" />{t('home:shortcutHelp')}</Link></Button>
        </div>
      </section>
    </div>
  </>;
}
