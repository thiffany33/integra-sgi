import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
const menuContent = 'z-50 min-w-56 rounded-lg border bg-card p-1 text-foreground shadow-lg';
const menuItem = 'flex min-h-12 cursor-default items-center rounded-md px-3 text-base outline-none focus:bg-accent';

export function BrandLink() {
  const { t } = useTranslation('navigation');
  return <Link to="/" aria-label={t('brandHome')} className="flex min-h-12 items-center gap-3 rounded-md">
    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-white"><Sprout aria-hidden="true" className="size-6" /></span>
    <span className="text-2xl font-bold tracking-tight">integra<span className="ml-2 text-base font-medium text-muted-foreground">SGI</span></span>
  </Link>;
}

export function LanguageMenu({ className }: { className?: string }) {
  const { t, i18n } = useTranslation(['common', 'navigation']);
  const auth = useAuth();
  const [error, setError] = useState('');
  const activeLocale = supportedLocales.find(locale => locale === i18n.resolvedLanguage) ?? 'pt-PT';

  async function changeLocale(value: string) {
    if (!supportedLocales.includes(value as SupportedLocale)) return;
    setError('');
    try {
      await auth.updateLocale(value as SupportedLocale);
    } catch {
      setError(t('languageSaveError', { ns: 'common' }));
    }
  }

  return <>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`${t('navigation:language')}: ${localeNames[activeLocale]}`}
          className={cn('min-w-0 max-w-full justify-start gap-2 text-base', className)}
        >
          <span aria-hidden="true" className="text-xl leading-none">{localeFlags[activeLocale]}</span>
          <span className="truncate">{localeNames[activeLocale]}</span>
          <ChevronDown aria-hidden="true" className="ml-auto size-4 shrink-0" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className={menuContent}>
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
    {error && <p role="status" className="text-sm text-destructive">{error}</p>}
  </>;
}

/** Account button with profile and sign-out. `wide` shows the name, for the sidebar. */
export function AccountMenu({ wide = false, align = 'end' }: { wide?: boolean; align?: 'start' | 'end' }) {
  const { t } = useTranslation('navigation');
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  if (auth.status !== 'authenticated') return null;
  const initials = auth.user.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]?.toLocaleUpperCase()).join('');

  async function logout() {
    setError('');
    try {
      navigate('/login', { replace: true });
      await auth.logout();
    } catch {
      setError(t('logoutError'));
    }
  }

  async function loadPhoto() {
    setPhotoLoaded(false);
    try { setPhotoUrl(await profileApi.getPhoto()); }
    catch { setPhotoUrl(null); }
    finally { setPhotoLoaded(true); }
  }

  const avatar = <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
    {photoLoaded && photoUrl ? <img src={photoUrl} alt="" className="size-full object-cover" /> : initials || <UserRound aria-hidden="true" className="size-6" />}
  </span>;

  return <>
    <DropdownMenu.Root onOpenChange={open => { if (open) void loadPhoto(); }}>
      <DropdownMenu.Trigger asChild>
        {wide
          ? <Button variant="outline" aria-label={t('accountMenu', { name: auth.user.name })} className="h-auto min-h-14 w-full justify-start gap-3 px-3 py-2 text-left">
            {avatar}
            <span aria-hidden="true" className="min-w-0 flex-1"><span className="block truncate font-semibold">{t('myAccount')}</span><span className="block truncate text-sm font-normal text-muted-foreground">{auth.user.name}</span></span>
            <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
          </Button>
          : <Button variant="outline" size="icon" aria-label={t('accountMenu', { name: auth.user.name })} className="size-12 rounded-full p-0 sm:w-auto sm:gap-2 sm:rounded-lg sm:pr-3">
            {avatar}
            <span aria-hidden="true" className="hidden whitespace-nowrap sm:inline">{t('myAccount')}</span>
          </Button>}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align={align} side={wide ? 'top' : 'bottom'} sideOffset={6} className={menuContent}>
          <div className="border-b px-3 py-3"><p className="text-base font-semibold">{auth.user.name}</p><p className="text-sm text-muted-foreground">{auth.user.email}</p></div>
          <DropdownMenu.Item asChild className={menuItem}>
            <Link to="/profile">{t('profile')}</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={event => { event.preventDefault(); void logout(); }} className={menuItem}>
            {t('logout')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </>;
}
