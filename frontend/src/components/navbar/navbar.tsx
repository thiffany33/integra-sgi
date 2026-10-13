import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context-value';
import { AccountMenu, BrandLink, LanguageMenu } from './navbar-parts';

/** Top navigation for visitors and while the session is being checked; signed-in pages use AppShell. */
export default function Navbar() {
  const { t } = useTranslation(['common', 'navigation']);
  const auth = useAuth();
  const signedIn = auth.status === 'authenticated';
  const links = [
    { to: '/', label: t('navigation:home') },
    ...(signedIn ? [{ to: '/dashboard', label: t('navigation:dashboard') }] : []),
    { to: '/requirement', label: t('navigation:guidance') },
    ...(signedIn ? [{ to: '/downloads', label: t('navigation:downloads') }] : []),
    { to: '/contact', label: t('navigation:help') },
    ...(!signedIn ? [
      { to: '/login', label: t('navigation:login') },
      { to: '/register', label: t('navigation:register') },
    ] : []),
    ...(auth.status === 'authenticated' && auth.user.role === 'PLATFORM_ADMIN'
      ? [{ to: '/admin/customers', label: t('navigation:adminCustomers') }] : []),
  ];

  return <header className="border-b bg-card">
    <div className="page-shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
      <BrandLink />
      <nav aria-label={t('navigation:label')} className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:flex-wrap">
        {links.map(({ to, label }) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => cn("inline-flex min-h-12 items-center rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent", isActive ? "bg-secondary text-secondary-foreground underline decoration-2 underline-offset-8" : "text-foreground")}>{label}</NavLink>)}
        <AccountMenu />
      </nav>
      <LanguageMenu />
    </div>
  </header>;
}
