import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context-value';
import { RequireAuth } from './require-auth';

export function RequirePlatformAdmin({ children }: { children: ReactNode }) {
  return <RequireAuth><AdminOnly>{children}</AdminOnly></RequireAuth>;
}

function AdminOnly({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (auth.status !== 'authenticated') return null;
  if (auth.user.role !== 'PLATFORM_ADMIN') return <Navigate to="/" replace />;
  return children;
}
