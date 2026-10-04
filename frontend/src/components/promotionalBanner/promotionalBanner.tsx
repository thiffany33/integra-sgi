import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
export default function PromotionalBanner() {
  const { t } = useTranslation('home');
  return <section className="my-4 flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-7 text-white sm:p-10 lg:flex-row lg:items-center">
    <div className="max-w-2xl"><h2 className="mb-3 text-2xl">{t('noStartZero')}</h2><p>{t('promoDescription')}</p></div>
    <Button asChild variant="secondary" size="lg" className="shrink-0"><Link to="/downloads">{t('seeTemplates')} <ArrowRight aria-hidden="true" className="size-5" /></Link></Button>
  </section>;
}
