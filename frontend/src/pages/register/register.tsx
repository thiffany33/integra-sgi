import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { useState } from "react";
import { useOnboarding } from "@/contexts/onboarding-state";
import { PageHeading } from "@/components/pageHeading/pageHeading";
import { SetupSteps } from "@/components/setupSteps/setupSteps";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { AccessTabs } from '@/pages/login/access-tabs';
import { safeReturnTo } from '@/lib/return-to';

export default function Register() {
  const { organization, updateOrganization } = useOnboarding();
  const { t } = useTranslation('onboarding');
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.has('returnTo') ? safeReturnTo(searchParams.get('returnTo')) : null;
  const nextRoute = `/representative${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
  return <div className="mx-auto max-w-3xl">
    <AccessTabs active="register" returnTo={returnTo} />
    <div id="access-panel" role="tabpanel" aria-labelledby="access-register-tab">
    <SetupSteps current={1} />
        <PageHeading title={t('organizationTitle')} description={t('organizationDescription')} />
    <Card className="shadow-none"><CardContent>
      <form className="space-y-6" onSubmit={event => { event.preventDefault(); if (!organization.name.trim()) { setError(t('nameError')); return; } navigate(nextRoute); }}>
        <p className="text-base text-muted-foreground">{t('organizationFields')}</p>
        <div className="field"><Label htmlFor="company-name">{t('organizationName')}</Label><Input id="company-name" autoComplete="organization" value={organization.name} onChange={e => { updateOrganization({ name: e.target.value }); setError(""); }} required aria-invalid={Boolean(error)} aria-describedby={error ? "name-error" : undefined} />{error && <p id="name-error" role="alert" className="text-base text-destructive">{error}</p>}</div>
        <div className="field"><Label htmlFor="nif">{t('nif')}</Label><Input id="nif" inputMode="numeric" value={organization.nif} onChange={e => updateOrganization({ nif: e.target.value })} required aria-describedby="nif-hint" /><p id="nif-hint" className="field-hint">{t('nifHint')}</p></div>
        <div className="field"><Label htmlFor="sector">{t('sector')}</Label><NativeSelect id="sector" value={organization.sector} onChange={e => updateOrganization({ sector: e.target.value })} required><NativeSelectOption value="">{t('chooseSector')}</NativeSelectOption>{[["Alimentar", "food"], ["Construção", "construction"], ["Serviços", "services"], ["Agronegócio", "agribusiness"], ["Comércio", "trade"], ["Indústria", "industry"], ["Tecnologia", "technology"]].map(([value, key]) => <NativeSelectOption key={value} value={value}>{t(key)}</NativeSelectOption>)}</NativeSelect></div>
        <div className="field"><Label htmlFor="company-email">{t('primaryEmail')}</Label><Input id="company-email" type="email" autoComplete="email" value={organization.email} onChange={e => updateOrganization({ email: e.target.value })} required aria-describedby="email-hint" /><p id="email-hint" className="field-hint">{t('emailExample')}</p></div>
        <Alert role="note" className="bg-secondary/40"><Info aria-hidden="true" /><AlertDescription>{t('temporaryNotice')}</AlertDescription></Alert>
        <div className="form-actions"><Button asChild variant="outline"><Link to="/"><ArrowLeft aria-hidden="true" />{t('backHome')}</Link></Button><Button type="submit">{t('continueRepresentative')}<ArrowRight aria-hidden="true" /></Button></div>
      </form>
    </CardContent></Card>
    </div>
  </div>;
}
