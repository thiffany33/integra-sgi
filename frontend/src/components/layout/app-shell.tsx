import { useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Building2, ClipboardList, Download, LayoutDashboard, LifeBuoy, Menu, X, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context-value';
import { AccountMenu, BrandLink, LanguageMenu } from '@/components/navbar/navbar-parts';

const largeScreen = '(min-width: 64rem)';
const subscribeToScreen = (onChange: () => void) => {
  const query = window.matchMedia(largeScreen);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const isLargeScreen = () => window.matchMedia(largeScreen).matches;

type Item = { to: string; label: string; icon: LucideIcon; active: (pathname: string) => boolean };

/** Signed-in layout: a sidebar on large screens, a menu button on small ones. */
export function AppShell({ main, children }: { main: RefObject<HTMLElement | null>; children: ReactNode }) {
  const { t } = useTranslation('navigation');
  const auth = useAuth();
  const { pathname } = useLocation();
  // The mobile menu stays open only on the page where it was opened, so following a link closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  // Rendered in one place only, so the account button is never duplicated for assistive technology.
  const large = useSyncExternalStore(subscribeToScreen, isLargeScreen);

  const items: Item[] = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, active: path => path === '/dashboard' },
    { to: '/organization-discovery', label: t('discovery'), icon: ClipboardList, active: path => path === '/organization-discovery' },
    { to: '/requirement', label: t('guidance'), icon: BookOpen, active: path => path.startsWith('/requirement') },
    { to: '/downloads', label: t('downloads'), icon: Download, active: path => path === '/downloads' },
    { to: '/contact', label: t('help'), icon: LifeBuoy, active: path => path === '/contact' },
    ...(auth.status === 'authenticated' && auth.user.role === 'PLATFORM_ADMIN'
      ? [{ to: '/admin/customers', label: t('adminCustomers'), icon: Building2, active: (path: string) => path.startsWith('/admin') }] : []),
  ];

  return <div className="min-h-screen lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
    <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3 lg:hidden">
      <BrandLink />
      <div className="flex items-center gap-2">
        {!large && <AccountMenu />}
        <Button variant="outline" className="min-h-12" aria-expanded={open} aria-controls="app-sidebar" onClick={() => setOpenOn(open ? null : pathname)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}{t('menu')}
        </Button>
      </div>
    </header>
    <aside id="app-sidebar" className={cn('flex-col gap-6 border-b bg-card p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-5', open ? 'flex' : 'hidden')}>
      <div className="hidden lg:block"><BrandLink /></div>
      <nav aria-label={t('label')} className="flex flex-1 flex-col gap-6">
        <ul className="grid gap-1">
          {items.map(({ to, label, icon: Icon, active }) => {
            const current = active(pathname);
            return <li key={to}><Link to={to} aria-current={current ? 'page' : undefined} className={cn('flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent', current ? 'bg-secondary font-semibold text-secondary-foreground' : 'text-foreground')}>
              <Icon aria-hidden="true" className="size-5 shrink-0" />{label}
            </Link></li>;
          })}
        </ul>
        {large && <div className="mt-auto"><AccountMenu wide align="start" /></div>}
      </nav>
      <LanguageMenu className="w-full" />
    </aside>
    <main id="conteudo" ref={main} tabIndex={-1} className="min-w-0 px-5 py-8 outline-none sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  </div>;
}
