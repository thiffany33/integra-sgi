import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageHeading } from "@/components/pageHeading/pageHeading";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
export default function Requirement() {
  const { t } = useTranslation(['requirements', 'navigation']);
  const chapters = [4, 5, 6, 7];
  return <><PageHeading eyebrow={t('navigation:guidance')} title={t('requirements:indexTitle')} description={t('requirements:indexDescription')} />
    <Alert role="note" className="mb-8"><AlertDescription>{t('requirements:publicNotice')}</AlertDescription></Alert>
    <div className="grid gap-5 md:grid-cols-2">{chapters.map(number => <Card key={number} className="shadow-none"><CardContent className="flex h-full flex-col items-start gap-4"><span className="grid size-12 place-items-center rounded-xl bg-secondary text-xl font-bold text-secondary-foreground">{number}</span><h2>{t(`requirements:chapter${number}`)}</h2><p className="mb-2 flex-1 text-muted-foreground">{t(`requirements:chapter${number}Description`)}</p><Button asChild variant={number === 4 ? "default" : "outline"}><Link to={`/login?returnTo=%2Frequirement${number}`}>{t('requirements:startRequirement', { number })}<ArrowRight aria-hidden="true" /></Link></Button></CardContent></Card>)}</div>
    <p className="mt-8 text-base text-muted-foreground">{t('requirements:numbering')}</p>
  </>;
}
