import { useOnboarding } from "@/contexts/onboarding-state";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { systemOptions } from "@/lib/systems";
import { PageHeading } from "@/components/pageHeading/pageHeading";
import { SetupSteps } from "@/components/setupSteps/setupSteps";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context-value";
import { Input } from "@/components/ui/input";
import { useTranslation } from 'react-i18next';
import type { SupportedLocale } from '@integra/shared/auth';
import { supportedLocales } from '@/i18n';
export default function SelectSystems() {
  const { systems, updateSystems } = useOnboarding();
  const { organization, representative } = useOnboarding();
  const auth = useAuth();
  const { t, i18n } = useTranslation('onboarding');
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = Object.values(systems).some(Boolean);
  async function createAccount() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const selectedSystems = Object.entries(systems).filter(([, enabled]) => enabled).map(([system]) => system as "sgq" | "sga" | "sgsst");
      await auth.register({
        name: representative.name,
        email: organization.email,
        password,
        locale: supportedLocales.includes(i18n.resolvedLanguage as SupportedLocale) ? i18n.resolvedLanguage as SupportedLocale : "pt-PT",
        profile: {
          schemaVersion: 1,
          organization,
          representative,
          selectedSystems,
        },
      });
      navigate("/dashboard", { replace: true });
    } catch {
      setError(t('registrationError'));
    } finally {
      setBusy(false);
    }
  }
  return <div className="mx-auto max-w-3xl"><SetupSteps current={3} />
    <PageHeading title={t('systemsTitle')} description={t('systemsDescription')} />
    <form className="space-y-6" onSubmit={event => { event.preventDefault(); void createAccount(); }}>
      <fieldset className="min-w-0 space-y-4"><legend className="sr-only">{t('systemsLegend')}</legend>
        {systemOptions.map(item => <Card key={item.key} className={cn("gap-0 py-0 shadow-none transition-colors", systems[item.key] && "border-primary bg-secondary/30")}><CardContent className="p-0">
          <Label htmlFor={item.key} className="flex min-h-12 cursor-pointer items-start gap-4 p-5 leading-relaxed sm:p-6">
            <Checkbox id={item.key} checked={systems[item.key]} onCheckedChange={checked => updateSystems({ ...systems, [item.key]: checked === true })} className="mt-1" aria-describedby={`${item.key}-description`} />
            <span className="min-w-0"><span className="mb-2 block text-lg font-semibold">{t(item.key === 'sgq' ? 'quality' : item.key === 'sga' ? 'environment' : 'safety')}</span><Badge variant="secondary" className="mb-2">{item.code}</Badge><span id={`${item.key}-description`} className="block text-base font-normal text-muted-foreground">{t(item.key === 'sgq' ? 'qualityDescription' : item.key === 'sga' ? 'environmentDescription' : 'safetyDescription')}</span></span>
          </Label>
        </CardContent></Card>)}
      </fieldset>
      {!selected && <p role="alert" className="rounded-lg border bg-secondary p-4 text-base">{t('chooseOneSystem')}</p>}
      <div className="field"><Label htmlFor="account-password">{t('createPassword')}</Label><Input id="account-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} aria-describedby="password-help" /><p id="password-help" className="field-hint">{t('passwordHint')}</p></div>
      {error && <p role="alert" className="text-base text-destructive">{error}</p>}
      <div className="form-actions"><Button asChild variant="outline"><Link to="/representative"><ArrowLeft aria-hidden="true" />{t('backRepresentative')}</Link></Button><Button type="submit" disabled={!selected || busy}>{busy ? t('creatingAccount') : t('createAccountPlan')}<ArrowRight aria-hidden="true" /></Button></div>
    </form>
  </div>;
}
