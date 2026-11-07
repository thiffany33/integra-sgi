import axios from "axios";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { contactApi } from "@/api/contact.api";
import { useAuth } from "@/contexts/auth-context-value";

type Availability = 'checking' | 'available' | 'unavailable';

export default function ContactForm() {
  const { t } = useTranslation(['help', 'common']);
  const id = useId();
  const auth = useAuth();
  const signedIn = auth.status === 'authenticated' ? auth : null;
  const [availability, setAvailability] = useState<Availability>('checking');
  // Signed-in people start with their account details, which they can still change.
  const [name, setName] = useState(() => signedIn ? signedIn.profile.representative.name || signedIn.user.name : '');
  const [email, setEmail] = useState(() => signedIn?.user.email ?? '');
  const [message, setMessage] = useState('');
  // Hidden from people; automated submissions fill it in.
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    contactApi.status().then(
      result => { if (active) setAvailability(result.available ? 'available' : 'unavailable'); },
      () => { if (active) setAvailability('unavailable'); },
    );
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    if (message.trim().length < 10) { setError(t('contactMessageShort')); return; }
    setSending(true);
    setError(null);
    try {
      await contactApi.send({ name: name.trim(), email: email.trim(), message: message.trim(), ...(website ? { website } : {}) });
      setSent(true);
      setMessage('');
    } catch (failure) {
      const status = axios.isAxiosError(failure) ? failure.response?.status : undefined;
      if (status === 503) setAvailability('unavailable');
      setError(t(status === 429 ? 'contactRateLimited' : status === 400 ? 'contactInvalid' : 'contactError'));
    } finally {
      setSending(false);
    }
  }

  const disabled = availability !== 'available';
  return <Card className="shadow-none">
    <CardHeader><h2>{t('contactTeam')}</h2><p className="text-muted-foreground">{t('contactIntro')}</p></CardHeader>
    <CardContent className="space-y-6">
      {availability === 'unavailable' && <Alert role="note"><Info aria-hidden="true" /><AlertTitle>{t('contactPreparing')}</AlertTitle><AlertDescription>{t('contactUnavailable')}</AlertDescription></Alert>}
      {sent ? <div role="status" className="space-y-4 rounded-lg border bg-secondary p-5">
        <p className="font-semibold">{t('contactSentTitle')}</p>
        <p>{t('contactSent')}</p>
        <Button type="button" variant="outline" onClick={() => setSent(false)}>{t('contactAnother')}</Button>
      </div> : <form className="space-y-5" onSubmit={submit} aria-busy={sending}>
        <div className="field"><Label htmlFor={`${id}-name`}>{t('contactName')}</Label><Input id={`${id}-name`} autoComplete="name" required maxLength={120} value={name} onChange={event => setName(event.target.value)} disabled={disabled} /></div>
        <div className="field"><Label htmlFor={`${id}-email`}>{t('contactEmail')}</Label><Input id={`${id}-email`} type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={disabled} /></div>
        <div className="field"><Label htmlFor={`${id}-message`}>{t('contactMessage')}</Label><Textarea id={`${id}-message`} rows={5} required minLength={10} maxLength={4000} value={message} onChange={event => setMessage(event.target.value)} disabled={disabled} /></div>
        <div className="hidden" aria-hidden="true"><label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
        <p className="text-sm text-muted-foreground">{t('contactPrivacy')} <Link className="text-link" to="/privacidade">{t('common:privacyPolicy')}</Link></p>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        <Button type="submit" disabled={disabled || sending}>{sending ? t('contactSending') : availability === 'unavailable' ? t('contactDisabled') : t('contactSend')}</Button>
      </form>}
    </CardContent>
  </Card>;
}
