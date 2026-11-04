import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api/auth.api';
import { useTranslation } from 'react-i18next';
import { safeReturnTo } from '@/lib/return-to';

export default function VerifyEmail() {
  const { t } = useTranslation('auth');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const returnTo = safeReturnTo(params.get('returnTo'));
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [message, setMessage] = useState(token ? t('verifying') : params.get('email') ? t('verificationInstructions') : t('missingToken'));
  const [failed, setFailed] = useState(!token && !params.get('email'));
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  useEffect(() => {
    if (!token) return;
    void authApi.verifyEmail(token).then(() => setMessage(t('verified'))).catch(() => {
      setFailed(true); setMessage(t('invalidVerification'));
    });
  }, [token, t]);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  const showResend = failed || !token;
  return <div className="mx-auto max-w-2xl"><PageHeading title={t('verifyTitle')} description={t('verifyDescription')} />
    <Card className="shadow-none"><CardContent className="space-y-5"><p role={failed ? 'alert' : 'status'}>{message}</p>
      {showResend && <form className="space-y-4" onSubmit={event => void resend(event)}><div className="field"><Label htmlFor="verification-email">{t('email')}</Label><Input id="verification-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></div><Button type="submit" disabled={resending}>{resending ? t('resendingVerification') : t('resendVerification')}</Button>{resendMessage && <p role="status">{resendMessage}</p>}</form>}
      <Link className="text-link" to={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login'}>{t('goToLogin')}</Link></CardContent></Card>
  </div>;
}
