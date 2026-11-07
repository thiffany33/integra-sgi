import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context-value';
import { homePath, safeReturnTo } from '@/lib/return-to';
import { useTranslation } from 'react-i18next';
import { AccessTabs } from './access-tabs';
import { authApi } from '@/api/auth.api';

export default function Login() {
  const auth = useAuth();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get('returnTo'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNeedsVerification(false);
    setResendMessage('');
    try {
      const user = await auth.login(email, password);
      navigate(searchParams.has('returnTo') ? returnTo : homePath(user.isAdmin), { replace: true });
    } catch (requestError) {
      const response = axios.isAxiosError(requestError) ? requestError.response?.data as { error?: { code?: string } } | undefined : undefined;
      const emailNeedsVerification = response?.error?.code === 'EMAIL_NOT_VERIFIED';
      setNeedsVerification(emailNeedsVerification);
      setError(t(emailNeedsVerification ? 'emailNotVerified' : 'invalidCredentials'));
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    setResending(true);
    setResendMessage('');
    try {
      await authApi.resendVerification(email);
      setResendMessage(t('verificationSent'));
    } catch {
      setResendMessage(t('verificationResendError'));
    } finally {
      setResending(false);
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
        {needsVerification && <div className="space-y-3 rounded-lg border p-4"><Button type="button" variant="outline" disabled={resending || !email} onClick={() => void resendVerification()}>{resending ? t('resendingVerification') : t('resendVerification')}</Button>{resendMessage && <p role="status" className="rounded-lg border border-primary/30 bg-secondary/50 px-4 py-3 text-base text-secondary-foreground">{resendMessage}</p>}</div>}
        <Button type="submit" disabled={busy || auth.status === 'loading'}>{busy ? t('loggingIn') : t('login')}<ArrowRight aria-hidden="true" /></Button>
      </form>
      <p className="text-base"><Link className="text-link" to="/forgot-password">{t('forgot')}</Link></p>
    </CardContent></Card>
    </div>
  </div>;
}
