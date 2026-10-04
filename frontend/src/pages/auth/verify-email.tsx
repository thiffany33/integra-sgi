import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Card, CardContent } from '@/components/ui/card';
import { authApi } from '@/api/auth.api';
import { useTranslation } from 'react-i18next';

export default function VerifyEmail() {
  const { t } = useTranslation('auth');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [message, setMessage] = useState(token ? t('verifying') : t('missingToken'));
  const [failed, setFailed] = useState(!token);
  useEffect(() => {
    if (!token) return;
    void authApi.verifyEmail(token).then(() => setMessage(t('verified'))).catch(() => {
      setFailed(true); setMessage(t('invalidVerification'));
    });
  }, [token, t]);
  return <div className="mx-auto max-w-2xl"><PageHeading title={t('verifyTitle')} description={t('verifyDescription')} />
    <Card className="shadow-none"><CardContent className="space-y-5"><p role={failed ? 'alert' : 'status'}>{message}</p><Link className="text-link" to="/login">{t('goToLogin')}</Link></CardContent></Card>
  </div>;
}
