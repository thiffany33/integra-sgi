import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi, type AdminInsights, type InsightCount } from '../../api/admin.api';
import { PageHeading } from '../../components/pageHeading/pageHeading';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { discoveryValueLabels } from '../organization-discovery/discovery-summary';

// Sectors are stored as the Portuguese option text chosen at registration.
const sectorKeys: Record<string, string> = {
  Alimentar: 'food', 'Construção': 'construction', 'Serviços': 'services', 'Agronegócio': 'agribusiness',
  'Comércio': 'trade', 'Indústria': 'industry', Tecnologia: 'technology',
};
const systemKeys: Record<string, string> = { sgq: 'quality', sga: 'environment', sgsst: 'safety' };

function percent(count: number, base: number): number {
  return base ? Math.round((count / base) * 100) : 0;
}

/** Ranked horizontal bars; the count and share are printed, so the bar is never the only carrier of the value. */
function BarList({ title, items, base, label, baseLabel }: {
  title: string; items: InsightCount[]; base: number; label: (value: string) => string; baseLabel: string;
}) {
  const { t } = useTranslation('admin');
  return <Card className="shadow-none">
    <CardHeader><h2 className="text-xl">{title}</h2><p className="text-sm text-muted-foreground">{baseLabel}</p></CardHeader>
    <CardContent>
      {base === 0 ? <p className="text-muted-foreground">{t('insightsNoAnswers')}</p> : <ul className="space-y-3">
        {items.map(item => <li key={item.value}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-base">
            <span>{label(item.value)}</span>
            <span className="font-semibold tabular-nums">{t('insightsCountShare', { count: item.count, percent: percent(item.count, base) })}</span>
          </div>
          <div aria-hidden="true" className="mt-1 h-2 rounded-sm bg-muted">
            <div className="h-2 rounded-sm bg-brand-green" style={{ width: `${percent(item.count, base)}%` }} />
          </div>
        </li>)}
      </ul>}
    </CardContent>
  </Card>;
}

export default function AdminInsightsPage() {
  const { t, i18n } = useTranslation(['admin', 'organizationDiscovery', 'onboarding']);
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [failed, setFailed] = useState(false);
  const requestId = useRef(0);
  const initialLoadStarted = useRef(false);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setFailed(false);
    try {
      const result = await adminApi.insights();
      if (current === requestId.current) setInsights(result);
    } catch {
      if (current === requestId.current) setFailed(true);
    }
  }, []);

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    void Promise.resolve().then(load);
  }, [load]);

  const discovery = (value: string) => t(`organizationDiscovery:${discoveryValueLabels[value] ?? value}`);
  const heading = <PageHeading eyebrow={t('admin:insightsEyebrow')} title={t('admin:insightsTitle')} description={t('admin:insightsDescription')} />;

  if (failed) return <>{heading}<div role="alert" className="space-y-4"><p>{t('admin:insightsError')}</p><Button onClick={() => void load()}>{t('admin:tryAgain')}</Button></div></>;
  if (!insights) return <>{heading}<p role="status">{t('admin:insightsLoading')}</p></>;

  const { funnel, answered } = insights;
  const stages = [
    { key: 'registered', count: funnel.registered },
    { key: 'emailVerified', count: funnel.emailVerified },
    { key: 'discoveryStarted', count: funnel.discoveryStarted },
    { key: 'discoveryCompleted', count: funnel.discoveryCompleted },
  ];
  const month = new Intl.DateTimeFormat(i18n.language, { month: 'short', year: '2-digit', timeZone: 'UTC' });
  const monthMax = Math.max(1, ...insights.registrationsByMonth.map(item => item.count));
  const inProgress = insights.stoppedAtStep.reduce((total, item) => total + item.count, 0);
  const answeredBy = (count: number) => t('admin:insightsBase', { count });

  return <>
    {heading}
    <p className="mb-6 text-sm text-muted-foreground">{t('admin:insightsUpdated', { date: new Date(insights.generatedAt).toLocaleString(i18n.language) })} <Button variant="link" className="h-auto p-0 align-baseline" onClick={() => void load()}>{t('admin:refresh')}</Button></p>

    <section aria-labelledby="funnel-title" className="mb-8">
      <h2 id="funnel-title" className="mb-4 text-xl">{t('admin:insightsFunnel')}</h2>
      <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stages.map(stage => <li key={stage.key}><Card className="h-full shadow-none"><CardContent className="pt-6">
          <p className="text-base text-muted-foreground">{t(`admin:insightsStage_${stage.key}`)}</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums">{stage.count}</p>
          {stage.key !== 'registered' && <p className="mt-1 text-sm text-muted-foreground">{t('admin:insightsOfRegistered', { percent: percent(stage.count, funnel.registered) })}</p>}
        </CardContent></Card></li>)}
      </ul>
    </section>

    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <BarList title={t('admin:insightsStoppedAt')} items={insights.stoppedAtStep} base={inProgress}
        baseLabel={t('admin:insightsInProgress', { count: inProgress })}
        label={value => t(`organizationDiscovery:step${value}Title`)} />

      <Card className="shadow-none">
        <CardHeader><h2 className="text-xl">{t('admin:insightsRegistrations')}</h2><p className="text-sm text-muted-foreground">{t('admin:insightsLastMonths')}</p></CardHeader>
        <CardContent>
          <ol className="flex h-48 items-end gap-1">
            {insights.registrationsByMonth.map((item, index) => {
              const [year, monthNumber] = item.value.split('-').map(Number);
              const name = month.format(new Date(Date.UTC(year, monthNumber - 1, 1)));
              return <li key={item.value} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" aria-label={t('admin:insightsMonthCount', { month: name, count: item.count })}>
                <span aria-hidden="true" className="text-xs font-semibold tabular-nums">{item.count || ''}</span>
                <span aria-hidden="true" className="w-full max-w-6 rounded-t-sm bg-brand-green" style={{ height: `${(item.count / monthMax) * 75}%`, minHeight: item.count ? 4 : 1 }} />
                {/* Narrow screens label every third month, the last one included, so labels never overlap. */}
                <span aria-hidden="true" className={`whitespace-nowrap text-center text-[0.65rem] text-muted-foreground ${(insights.registrationsByMonth.length - 1 - index) % 3 ? 'max-sm:invisible' : ''}`}>{name}</span>
              </li>;
            })}
          </ol>
        </CardContent>
      </Card>

      <BarList title={t('admin:insightsSystems')} items={insights.selectedSystems} base={funnel.registered}
        baseLabel={answeredBy(funnel.registered)} label={value => t(`onboarding:${systemKeys[value] ?? value}`)} />
      <BarList title={t('admin:insightsSectors')} items={insights.sectors} base={funnel.registered}
        baseLabel={answeredBy(funnel.registered)} label={value => sectorKeys[value] ? t(`onboarding:${sectorKeys[value]}`) : value} />
      <BarList title={t('organizationDiscovery:teamSize')} items={insights.workforceRanges} base={answered.organization}
        baseLabel={answeredBy(answered.organization)} label={discovery} />
      <BarList title={t('organizationDiscovery:activityTypes')} items={insights.activityTypes} base={answered.activity}
        baseLabel={answeredBy(answered.activity)} label={discovery} />
      <BarList title={t('organizationDiscovery:customerTypes')} items={insights.customerTypes} base={answered.activity}
        baseLabel={answeredBy(answered.activity)} label={discovery} />
      <BarList title={t('organizationDiscovery:operatingAreas')} items={insights.operatingAreas} base={answered.activity}
        baseLabel={answeredBy(answered.activity)} label={discovery} />
      <BarList title={t('organizationDiscovery:step4Title')} items={insights.processActivities} base={answered.processes}
        baseLabel={answeredBy(answered.processes)} label={discovery} />
      <BarList title={t('organizationDiscovery:attentionTopics')} items={insights.attentionTopics} base={answered.attention}
        baseLabel={answeredBy(answered.attention)} label={discovery} />
    </div>
    <p className="mt-6 text-sm text-muted-foreground">{t('admin:insightsPrivacy')}</p>
  </>;
}
