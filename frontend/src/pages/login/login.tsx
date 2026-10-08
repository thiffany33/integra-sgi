import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context-value';
import { safeReturnTo } from '@/lib/return-to';
import { useTranslation } from 'react-i18next';
import { AccessTabs } from './access-tabs';

export default function Login() {
  const auth = useAuth();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get('returnTo'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await auth.login(email, password);
      navigate(returnTo, { replace: true });
    } catch {
      setError(t('invalidCredentials'));
    } finally {
      setBusy(false);
    }
  }

  return <div className="mx-auto max-w-2xl">
    <AccessTabs active="login" returnTo={returnTo} />
    <div id="access-panel" role="tabpanel" aria-labelledby="access-login-tab">
    <PageHeading title={t('loginTitle')} description={t('loginDescription')} />
    <Card className="shadow-none"><CardContent className="space-y-6">
      <Alert role="note"><Info aria-hidden="true" /><AlertTitle>{t('loginInfoTitle')}</AlertTitle><AlertDescription>{t('loginInfo')}</AlertDescription></Alert>
      {auth.status === 'unavailable' && <Alert variant="destructive"><AlertDescription>{auth.error} <button type="button" className="text-link" onClick={() => void auth.retry()}>{t('retry', { ns: 'common' })}</button></AlertDescription></Alert>}
      <form className="space-y-5" onSubmit={submit}>
        <div className="field"><Label htmlFor="login-email">{t('email')}</Label><Input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="field"><Label htmlFor="login-password">{t('password')}</Label><Input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        {error && <p role="alert" className="text-base text-destructive">{error}</p>}
        <Button type="submit" disabled={busy || auth.status === 'loading'}>{busy ? t('loggingIn') : t('login')}<ArrowRight aria-hidden="true" /></Button>
      </form>
      <p className="text-base"><Link className="text-link" to="/forgot-password">{t('forgot')}</Link></p>
    </CardContent></Card>
    </div>
  </div>;
}
