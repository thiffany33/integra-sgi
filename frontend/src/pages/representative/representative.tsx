import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/contexts/onboarding-state";
import { PageHeading } from "@/components/pageHeading/pageHeading";
import { SetupSteps } from "@/components/setupSteps/setupSteps";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';
export default function Representative() {
  const { representative, updateRepresentative } = useOnboarding();
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  return <div className="mx-auto max-w-3xl"><SetupSteps current={2} />
    <PageHeading title={t('representativeTitle')} description={t('representativeDescription')} />
    <Card className="shadow-none"><CardContent><form className="space-y-6" onSubmit={event => { event.preventDefault(); navigate("/select-systems"); }}>
      <div className="field"><Label htmlFor="representative-name">{t('representativeName')}</Label><Input id="representative-name" autoComplete="name" value={representative.name} onChange={e => updateRepresentative({ name: e.target.value })} required pattern=".*\S.*" title={t('nameError')} /></div>
      <div className="field"><Label htmlFor="representative-email">{t('secondaryEmail')}</Label><Input id="representative-email" type="email" autoComplete="email" value={representative.email} onChange={e => updateRepresentative({ email: e.target.value })} /></div>
      <div className="field"><Label htmlFor="phone">{t('phone')}</Label><Input id="phone" type="tel" autoComplete="tel" value={representative.phone} onChange={e => updateRepresentative({ phone: e.target.value })} /></div>
      <p className="field-hint">{t('reviewDetails')}</p>
      <div className="form-actions"><Button asChild variant="outline"><Link to="/register"><ArrowLeft aria-hidden="true" />{t('backOrganization')}</Link></Button><Button type="submit">{t('continueSystems')}<ArrowRight aria-hidden="true" /></Button></div>
    </form></CardContent></Card>
  </div>;
}
