import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

type RequirementNavigationProps = { previousLink?: string; previousLabel?: string; nextLink?: string; nextLabel?: string };
export default function RequirementNavigation({ previousLink, previousLabel, nextLink, nextLabel }: RequirementNavigationProps) {
  const { t } = useTranslation('requirements');
  const localizeLabel = (label?: string) => label?.replace(/^Requisito/, t('requirementWord'));
  return <nav aria-label={t('sequence')} className="mt-10 grid gap-4 border-t pt-6 sm:grid-cols-2">
    <div>{previousLink && <Button asChild variant="outline" className="h-full w-full justify-start py-4 text-left"><Link to={previousLink}><ArrowLeft aria-hidden="true" className="size-5" /><span><span className="block text-sm text-muted-foreground">{t('back')}</span>{localizeLabel(previousLabel)}</span></Link></Button>}</div>
    <div>{nextLink && <Button asChild className="h-full w-full justify-between py-4 text-left"><Link to={nextLink}><span><span className="block text-sm">{t('continue')}</span>{localizeLabel(nextLabel)}</span><ArrowRight aria-hidden="true" className="size-5" /></Link></Button>}</div>
  </nav>;
}
