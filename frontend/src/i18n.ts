import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { SupportedLocale } from '@integra/shared/auth';

import ptCommon from './locales/pt-PT/common.json';
import ptNavigation from './locales/pt-PT/navigation.json';
import ptAuth from './locales/pt-PT/auth.json';
import ptOnboarding from './locales/pt-PT/onboarding.json';
import ptHome from './locales/pt-PT/home.json';
import ptProfile from './locales/pt-PT/profile.json';
import ptRequirements from './locales/pt-PT/requirements.json';
import ptDownloads from './locales/pt-PT/downloads.json';
import ptHelp from './locales/pt-PT/help.json';
import enCommon from './locales/en/common.json';
import enNavigation from './locales/en/navigation.json';
import enAuth from './locales/en/auth.json';
import enOnboarding from './locales/en/onboarding.json';
import enHome from './locales/en/home.json';
import enProfile from './locales/en/profile.json';
import enRequirements from './locales/en/requirements.json';
import enDownloads from './locales/en/downloads.json';
import enHelp from './locales/en/help.json';
import frCommon from './locales/fr/common.json';
import frNavigation from './locales/fr/navigation.json';
import frAuth from './locales/fr/auth.json';
import frOnboarding from './locales/fr/onboarding.json';
import frHome from './locales/fr/home.json';
import frProfile from './locales/fr/profile.json';
import frRequirements from './locales/fr/requirements.json';
import frDownloads from './locales/fr/downloads.json';
import frHelp from './locales/fr/help.json';
import deCommon from './locales/de/common.json';
import deNavigation from './locales/de/navigation.json';
import deAuth from './locales/de/auth.json';
import deOnboarding from './locales/de/onboarding.json';
import deHome from './locales/de/home.json';
import deProfile from './locales/de/profile.json';
import deRequirements from './locales/de/requirements.json';
import deDownloads from './locales/de/downloads.json';
import deHelp from './locales/de/help.json';

export const localeResources = {
  'pt-PT': { common: ptCommon, navigation: ptNavigation, auth: ptAuth, onboarding: ptOnboarding, home: ptHome, profile: ptProfile, requirements: ptRequirements, downloads: ptDownloads, help: ptHelp },
  en: { common: enCommon, navigation: enNavigation, auth: enAuth, onboarding: enOnboarding, home: enHome, profile: enProfile, requirements: enRequirements, downloads: enDownloads, help: enHelp },
  fr: { common: frCommon, navigation: frNavigation, auth: frAuth, onboarding: frOnboarding, home: frHome, profile: frProfile, requirements: frRequirements, downloads: frDownloads, help: frHelp },
  de: { common: deCommon, navigation: deNavigation, auth: deAuth, onboarding: deOnboarding, home: deHome, profile: deProfile, requirements: deRequirements, downloads: deDownloads, help: deHelp },
};

export const supportedLocales = ['pt-PT', 'en', 'fr', 'de'] as const;

export function detectLocale(languages: readonly string[] = typeof navigator === 'undefined' ? [] : navigator.languages): SupportedLocale {
  for (const language of languages) {
    const normalized = language.toLowerCase();
    if (normalized.startsWith('pt')) return 'pt-PT';
    const base = normalized.split('-')[0];
    if (base === 'en' || base === 'fr' || base === 'de') return base;
  }
  return 'pt-PT';
}

void i18n.use(initReactI18next).init({
  resources: localeResources,
  lng: detectLocale(),
  fallbackLng: 'pt-PT',
  supportedLngs: [...supportedLocales],
  defaultNS: 'common',
  ns: ['common', 'navigation', 'auth', 'onboarding', 'home', 'profile', 'requirements', 'downloads', 'help'],
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;
