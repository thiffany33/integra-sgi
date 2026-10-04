import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api/auth.api';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const { t } = useTranslation('auth');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    if (password !== confirmation) { setError(t('passwordMismatch')); return; }
    setBusy(true);
    try { await authApi.resetPassword(token, password); setMessage(t('passwordChanged')); }
    catch { setError(t('invalidReset')); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-2xl"><PageHeading title={t('resetTitle')} description={t('resetDescription')} />
    <Card className="shadow-none"><CardContent className="space-y-5">
      {!token ? <p role="alert" className="text-destructive">{t('invalidReset')}</p> : <form className="space-y-5" onSubmit={submit}>
        <div className="field"><Label htmlFor="new-password">{t('newPassword')}</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} /></div>
        <div className="field"><Label htmlFor="confirm-password">{t('repeatPassword')}</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={event => setConfirmation(event.target.value)} /></div>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        {message && <p role="status">{message}</p>}
        {!message && <Button type="submit" disabled={busy}>{busy ? t('saving') : t('changePassword')}</Button>}
      </form>}
      <Link className="text-link" to="/login">{t('goToLogin')}</Link>
    </CardContent></Card>
  </div>;
}
