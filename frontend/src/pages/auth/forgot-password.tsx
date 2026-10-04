import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api/auth.api';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try { await authApi.forgotPassword(email); setSent(true); }
    catch { setError('Não foi possível enviar as instruções agora. Tente novamente dentro de alguns minutos.'); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-2xl"><PageHeading title={t('forgotTitle')} description={t('forgotDescription')} />
    <Card className="shadow-none"><CardContent className="space-y-5">
      {sent ? <p role="status" className="rounded-lg border bg-secondary p-5">{t('genericRecovery')}</p> : <form className="space-y-5" onSubmit={submit}>
        <div className="field"><Label htmlFor="recovery-email">{t('accountEmail')}</Label><Input id="recovery-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></div>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? t('sending') : t('sendInstructions')}</Button>
      </form>}
      <Link className="text-link" to="/login">{t('backToLogin')}</Link>
    </CardContent></Card>
  </div>;
}
