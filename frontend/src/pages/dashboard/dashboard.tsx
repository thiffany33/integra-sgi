import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Download, SlidersHorizontal, Check } from "lucide-react";
import { systemOptions } from "@/lib/systems";
import { useOnboarding } from "@/contexts/onboarding-state";
import { PageHeading } from "@/components/pageHeading/pageHeading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
export default function Dashboard() {
  const { t } = useTranslation(['home', 'onboarding']);
  const { systems } = useOnboarding();
  const selected = systemOptions.filter(item => systems[item.key]);
  return <>
    <PageHeading eyebrow={t('home:dashboardEyebrow')} title={t('home:dashboardTitle')} description={t('home:dashboardDescription')} />
    {selected.length ? <div className="space-y-8">
      <section aria-labelledby="selected-title"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 id="selected-title">{t('home:selectedAreas')}</h2><Button asChild variant="outline"><Link to="/profile"><SlidersHorizontal aria-hidden="true" />{t('home:viewProfile')}</Link></Button></div>
        <div className="grid gap-4 md:grid-cols-3">{selected.map(item => <Card key={item.key} className="shadow-none"><CardContent><Check aria-hidden="true" className="mb-4 size-6 text-secondary-foreground" /><h3 className="mb-3">{t(item.key === 'sgq' ? 'onboarding:quality' : item.key === 'sga' ? 'onboarding:environment' : 'onboarding:safety')}</h3><Badge variant="secondary">{item.code}</Badge></CardContent></Card>)}</div>
      </section>
      <Alert role="note"><AlertDescription>{t('home:profileSavedNotice')} {t('home:systemsManagedNotice')}</AlertDescription></Alert>
      <Card className="border-primary/20 bg-secondary/40 shadow-none"><CardHeader><p className="eyebrow">{t('home:startHere')}</p><h2>{t('home:organizationContext')}</h2></CardHeader><CardContent className="space-y-5"><p className="max-w-2xl">{t('home:chapterIntro')}</p><Button asChild><Link to="/requirement4">{t('home:startRequirement')}<ArrowRight aria-hidden="true" /></Link></Button></CardContent></Card>
    </div> : <Card className="max-w-2xl shadow-none"><CardHeader><h2>{t('home:guestPlan')}</h2><p>{t('home:guestDescription')}</p></CardHeader><CardContent><Button asChild><Link to="/select-systems">{t('home:chooseSystems')}<ArrowRight aria-hidden="true" /></Link></Button></CardContent></Card>}
    <div className="mt-8 flex flex-wrap gap-4"><Button asChild variant="outline"><Link to="/requirement"><BookOpen aria-hidden="true" />{t('home:allGuide')}</Link></Button><Button asChild variant="outline"><Link to="/downloads"><Download aria-hidden="true" />{t('home:viewTemplates')}</Link></Button></div>
  </>;
}
