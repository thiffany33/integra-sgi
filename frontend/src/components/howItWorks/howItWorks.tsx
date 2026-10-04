import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
export default function HowItWorks() {
  const { t } = useTranslation('home');
  const steps = [1, 2, 3, 4].map(number => [t(`step${number}Title`), t(`step${number}Description`)]);
  return <section className="py-12" aria-labelledby="how-title">
    <p className="eyebrow mb-3">{t('howWorks')}</p><h2 id="how-title" className="mb-8 text-3xl">{t('clearPath')}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(([title, description], i) => <Card key={title} className="shadow-none"><CardContent>
        <span className="mb-6 grid size-11 place-items-center rounded-full bg-secondary text-lg font-bold text-secondary-foreground">{i + 1}</span>
        <h3 className="mb-3">{title}</h3><p className="text-base text-muted-foreground">{description}</p>
      </CardContent></Card>)}
    </div>
  </section>;
}
