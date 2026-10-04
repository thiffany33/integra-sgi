import { Link } from "react-router-dom";
import { ArrowRight, Check, Leaf, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';

export default function Banner() {
  const { t } = useTranslation(['home', 'onboarding']);
  return <section className="grid items-center gap-10 py-5 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:py-10" aria-labelledby="welcome-title">
    <div className="space-y-6">
      <p className="eyebrow">{t('home:heroEyebrow')}</p>
      <h1 id="welcome-title" className="max-w-xl text-4xl sm:text-5xl lg:text-6xl">{t('home:heroTitle')} <span className="text-secondary-foreground">{t('home:heroAccent')}</span></h1>
      <p className="max-w-xl text-lg text-muted-foreground">{t('home:heroDescription')}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg"><Link to="/register">{t('home:startPlan')} <ArrowRight className="size-5" aria-hidden="true" /></Link></Button>
        <Button asChild variant="outline" size="lg"><Link to="/requirement">{t('home:learnGuide')}</Link></Button>
      </div>
      <p className="flex items-start gap-2 text-base text-muted-foreground"><Check className="mt-1 size-5 shrink-0 text-secondary-foreground" aria-hidden="true" />{t('home:noStandards')}</p>
    </div>
    <Card className="gap-0 overflow-hidden border-secondary/80 bg-[#edf3ed] py-0 shadow-none">
      <CardContent className="p-7 sm:p-9">
        <p className="eyebrow mb-6">{t('home:pathTitle')}</p>
        <h2 className="mb-6 text-2xl">{t('home:threeAreas')}</h2>
        <div className="space-y-4">
          {[
            { icon: ShieldCheck, title: t('onboarding:quality'), description: t('home:qualityShort'), code: "ISO 9001" },
            { icon: Leaf, title: t('onboarding:environment'), description: t('home:environmentShort'), code: "ISO 14001" },
            { icon: HeartHandshake, title: t('onboarding:safety'), description: t('home:safetyShort'), code: "ISO 45001" },
          ].map(({ icon: Icon, title, description, code }) => <div key={title} className="flex items-start gap-4 rounded-xl border border-white bg-white/85 p-4">
            <Icon aria-hidden="true" className="mt-1 size-6 shrink-0 text-secondary-foreground" />
            <div><h3>{title}</h3><p className="text-base text-muted-foreground">{description}</p><p className="mt-1 text-sm font-semibold text-secondary-foreground">{code}</p></div>
          </div>)}
        </div>
        <p className="mt-6 text-base text-muted-foreground">{t('home:chooseAreas')}</p>
      </CardContent>
    </Card>
  </section>;
}
