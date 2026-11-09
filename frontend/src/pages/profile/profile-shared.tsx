import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Button } from '@/components/ui/button';
import { useAuth, type AuthContextValue } from '@/contexts/auth-context-value';

export type Message = { kind: 'success' | 'error'; text: string } | null;
export type AuthenticatedContext = Extract<AuthContextValue, { status: 'authenticated' }>;

export function Feedback({ message }: { message: Message }) {
  if (!message) return null;
  return <p role={message.kind === 'success' ? 'status' : 'alert'} className={`rounded-lg border px-4 py-3 text-base ${message.kind === 'success' ? 'border-primary/30 bg-secondary/50' : 'border-destructive/50 text-destructive'}`}>{message.text}</p>;
}

/** Renders the page only for a signed-in account; `returnTo` brings the person back here after signing in. */
export function ProfileGate({ returnTo, children }: { returnTo: string; children: (auth: AuthenticatedContext) => ReactNode }) {
  const auth = useAuth();
  const { t } = useTranslation('profile');
  if (auth.status === 'loading') return <p role="status">{t('loading')}</p>;
  if (auth.status !== 'authenticated') return <div className="mx-auto max-w-2xl"><PageHeading title={t('title')} description={t('signInRequired')} /><Button asChild><Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>{t('signIn')}</Link></Button></div>;
  return children(auth);
}

/** One area of the profile: a short page with its own heading and a way back to the overview. */
export function ProfileSubpage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const { t } = useTranslation('profile');
  return <div className="mx-auto max-w-4xl space-y-8 pb-8">
    <Link to="/profile" className="text-link inline-flex min-h-12 items-center gap-2 text-base"><ArrowLeft className="size-4" aria-hidden="true" />{t('backToProfile')}</Link>
    <PageHeading title={title} description={description} />
    {children}
  </div>;
}
