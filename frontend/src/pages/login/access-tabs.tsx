import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function AccessTabs({ active, returnTo }: { active: 'login' | 'register'; returnTo?: string | null }) {
  const { t } = useTranslation('auth');
  const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
  return <div role="tablist" aria-label={t('accessOptions')} className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-secondary/60 p-2">
    <Link id="access-login-tab" role="tab" aria-controls="access-panel" aria-selected={active === 'login'} to={`/login${query}`} className={`inline-flex min-h-12 items-center justify-center rounded-lg px-4 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${active === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:bg-card/70'}`}>{t('loginTab')}</Link>
    <Link id="access-register-tab" role="tab" aria-controls="access-panel" aria-selected={active === 'register'} to={`/register${query}`} className={`inline-flex min-h-12 items-center justify-center rounded-lg px-4 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${active === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:bg-card/70'}`}>{t('registerTab')}</Link>
  </div>;
}
