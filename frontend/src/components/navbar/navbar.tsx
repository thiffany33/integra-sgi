import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Sprout, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu } from 'radix-ui';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context-value';
import type { SupportedLocale } from '@integra/shared/auth';
import { supportedLocales } from '@/i18n';
import { profileApi } from '@/api/profile.api';

const localeNames: Record<SupportedLocale, string> = {
  en: 'English', 'pt-PT': 'Português (Portugal)', fr: 'Français', de: 'Deutsch',
};
const localeFlags: Record<SupportedLocale, string> = {
  en: '🇬🇧', 'pt-PT': '🇵🇹', fr: '🇫🇷', de: '🇩🇪',
};

export default function Navbar() {
  const { t, i18n } = useTranslation(['common', 'navigation']);
  const auth = useAuth();
  const navigate = useNavigate();
  const [languageError, setLanguageError] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
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
  const activeLocale = supportedLocales.find(locale => locale === i18n.resolvedLanguage) ?? 'pt-PT';

  async function changeLocale(value: string) {
    if (!supportedLocales.includes(value as SupportedLocale)) return;
    setLanguageError('');
    try {
      await auth.updateLocale(value as SupportedLocale);
    } catch {
      setLanguageError(t('languageSaveError', { ns: 'common' }));
    }
  }

  async function logout() {
    setLogoutError('');
    try {
      navigate('/login', { replace: true });
      await auth.logout();
    } catch {
      setLogoutError(t('navigation:logoutError'));
    }
  }

  async function loadPhoto() {
    if (!signedIn) return;
    setPhotoLoaded(false);
    try { setPhotoUrl(await profileApi.getPhoto()); }
    catch { setPhotoUrl(null); }
    finally { setPhotoLoaded(true); }
  }

  const initials = signedIn ? auth.user.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]?.toLocaleUpperCase()).join('') : '';

  return <header className="border-b bg-card">
    <div className="page-shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
      <Link to="/" aria-label={t('navigation:brandHome')} className="flex min-h-12 items-center gap-3 rounded-md">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-white"><Sprout aria-hidden="true" className="size-6" /></span>
        <span className="text-2xl font-bold tracking-tight">integra<span className="ml-2 text-base font-medium text-muted-foreground">SGI</span></span>
      </Link>
      <nav aria-label={t('navigation:label')} className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:flex-wrap">
        {links.map(({ to, label }) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => cn("inline-flex min-h-12 items-center rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent", isActive ? "bg-secondary text-secondary-foreground underline decoration-2 underline-offset-8" : "text-foreground")}>{label}</NavLink>)}
        {signedIn && <DropdownMenu.Root onOpenChange={open => { if (open) void loadPhoto(); }}>
          <DropdownMenu.Trigger asChild>
            <Button variant="outline" size="icon" aria-label={t('navigation:accountMenu', { name: auth.user.name })} className="size-12 rounded-full p-0 sm:w-auto sm:gap-2 sm:rounded-lg sm:pr-3">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                {photoLoaded && photoUrl ? <img src={photoUrl} alt="" className="size-full object-cover" /> : initials || <UserRound aria-hidden="true" className="size-6" />}
              </span>
              <span aria-hidden="true" className="hidden whitespace-nowrap sm:inline">{t('navigation:myAccount')}</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-56 rounded-lg border bg-card p-1 text-foreground shadow-lg">
              <div className="border-b px-3 py-3"><p className="text-base font-semibold">{auth.user.name}</p><p className="text-sm text-muted-foreground">{auth.user.email}</p></div>
              <DropdownMenu.Item asChild className="flex min-h-12 cursor-default items-center rounded-md px-3 text-base outline-none focus:bg-accent">
                <Link to="/profile">{t('navigation:profile')}</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={event => { event.preventDefault(); void logout(); }} className="flex min-h-12 cursor-default items-center rounded-md px-3 text-base outline-none focus:bg-accent">
                {t('navigation:logout')}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>}
      </nav>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="outline"
            size="sm"
            aria-label={`${t('navigation:language')}: ${localeNames[activeLocale]}`}
            className="min-w-0 max-w-full justify-start gap-2 text-base"
          >
            <span aria-hidden="true" className="text-xl leading-none">{localeFlags[activeLocale]}</span>
            <span className="truncate">{localeNames[activeLocale]}</span>
            <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-56 rounded-lg border bg-card p-1 text-foreground shadow-lg">
            <DropdownMenu.RadioGroup
              aria-label={t('navigation:language')}
              value={activeLocale}
              onValueChange={value => void changeLocale(value)}
            >
              {(['en', 'pt-PT', 'fr', 'de'] as const).map(locale => (
                <DropdownMenu.RadioItem
                  key={locale}
                  value={locale}
                  className="relative flex min-h-12 cursor-default select-none items-center gap-3 rounded-md px-3 text-base outline-none focus:bg-accent focus:text-accent-foreground data-[state=checked]:font-semibold"
                >
                  <span aria-hidden="true" className="text-xl leading-none">{localeFlags[locale]}</span>
                  <span>{localeNames[locale]}</span>
                  <DropdownMenu.ItemIndicator className="ml-auto"><Check aria-hidden="true" className="size-4" /></DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {languageError && <p role="status" className="text-sm text-destructive">{languageError}</p>}
      {logoutError && <p role="alert" className="text-sm text-destructive">{logoutError}</p>}
    </div>
  </header>;
}
