import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from 'react-i18next';

// The owner's name is a proper name, so it is the same in every language.
const COPYRIGHT_OWNER = 'Thiffany Gonçalves';

export default function Footer() {
  const { t } = useTranslation(['common', 'navigation']);
  return <footer className="mt-auto bg-card">
    <Separator />
    <div className="page-shell flex flex-col justify-between gap-6 py-8 sm:flex-row sm:items-center">
      <div><p className="font-semibold">{t('common:appName')}</p><p className="text-base text-muted-foreground">{t('common:footerTagline')}</p><p className="mt-2 text-sm text-muted-foreground">{t('common:footerRights', { year: new Date().getFullYear(), owner: COPYRIGHT_OWNER })}</p></div>
      <nav aria-label={t('navigation:footerLinks')} className="flex flex-wrap gap-5 text-base">
        <Link className="text-link inline-flex min-h-12 items-center" to="/requirement">{t('common:footerGuide')}</Link>
        <Link className="text-link inline-flex min-h-12 items-center" to="/contact">{t('common:footerHelp')}</Link>
      </nav>
    </div>
  </footer>;
}
