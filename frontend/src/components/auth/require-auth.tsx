import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/auth-context-value';
import { homePath, safeReturnTo } from '../../lib/return-to';

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

/** Sign-in and sign-up pages send a valid session straight to where the person was going. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const signingOut = (location.state as { signingOut?: boolean } | null)?.signingOut === true;
  if (auth.status === 'authenticated' && !signingOut) return <Navigate to={safeReturnTo(searchParams.get('returnTo'), homePath(auth.user.isAdmin))} replace />;
  return children;
}
