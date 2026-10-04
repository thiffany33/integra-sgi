import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/auth-context-value';

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === 'loading') return <p role="status">A verificar a sua conta…</p>;
  if (auth.status === 'unavailable') return <div role="alert" className="space-y-4"><p>{auth.error}</p><button type="button" className="text-link" onClick={() => void auth.retry()}>Tentar novamente</button></div>;
  if (auth.status !== 'authenticated') {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  return children;
}
