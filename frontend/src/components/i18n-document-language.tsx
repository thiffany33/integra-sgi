import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export function I18nDocumentLanguage({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation('common');
  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? 'pt-PT';
    document.title = t('appTitle');
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = t('metaDescription');
  }, [i18n, i18n.resolvedLanguage, t]);
  return children;
}
