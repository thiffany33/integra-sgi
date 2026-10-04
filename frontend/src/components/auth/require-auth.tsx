import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/auth-context-value';

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { t } = useTranslation('navigation');
  const location = useLocation();
  if (auth.status === 'loading') return <p role="status">{t('checkingAccount')}</p>;
  if (auth.status === 'unavailable') return <div role="alert" className="space-y-4"><p>{t('serviceUnavailable')}</p><button type="button" className="text-link" onClick={() => void auth.retry()}>{t('tryAgain')}</button></div>;
  if (auth.status !== 'authenticated') {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  return children;
}
