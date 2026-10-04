import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
export function SetupSteps({ current }: { current: 1 | 2 | 3 }) {
  const { t } = useTranslation('onboarding');
  const steps = [t('stepOrganization'), t('stepRepresentative'), t('stepSystems')];
  return <nav aria-label="Etapas de configuração" className="mb-9">
    <p className="mb-4 text-base font-semibold text-secondary-foreground">{t('stepLabel', { current })}</p>
    <ol className="flex flex-wrap gap-x-6 gap-y-3">
      {steps.map((step, i) => <li key={step} aria-current={current === i + 1 ? "step" : undefined} className={cn("flex items-center gap-2 text-base", current === i + 1 ? "font-bold text-primary" : "text-muted-foreground")}>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border text-sm font-bold", current >= i + 1 ? "border-primary bg-primary text-white" : "bg-card")}>{current > i + 1 ? <Check aria-hidden="true" className="size-4" /> : i + 1}</span>{step}
      </li>)}
    </ol>
  </nav>;
}
