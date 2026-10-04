import { Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useId } from "react";
import { useTranslation } from 'react-i18next';

export default function ContactForm() {
  const { t } = useTranslation('help');
  const id = useId();
  return <Card className="shadow-none">
    <CardHeader><h2>{t('contactTeam')}</h2><p className="text-muted-foreground">{t('contactIntro')}</p></CardHeader>
    <CardContent className="space-y-6">
      <Alert role="note"><Info aria-hidden="true" /><AlertTitle>{t('contactPreparing')}</AlertTitle><AlertDescription>{t('contactUnavailable')}</AlertDescription></Alert>
      <form className="space-y-5" onSubmit={event => event.preventDefault()}>
        <div className="field"><Label htmlFor={`${id}-name`}>{t('contactName')}</Label><Input id={`${id}-name`} autoComplete="name" disabled /></div>
        <div className="field"><Label htmlFor={`${id}-email`}>{t('contactEmail')}</Label><Input id={`${id}-email`} type="email" autoComplete="email" disabled /></div>
        <div className="field"><Label htmlFor={`${id}-message`}>{t('contactMessage')}</Label><Textarea id={`${id}-message`} rows={4} disabled /></div>
        <Button type="submit" disabled>{t('contactDisabled')}</Button>
      </form>
    </CardContent>
  </Card>;
}
