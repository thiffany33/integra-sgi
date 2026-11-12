import axios from 'axios';
import { startTransition, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CustomerProfileInput } from '@integra/shared/profile';
import type { ReadingPreferences, SupportedLocale } from '@integra/shared/auth';
import type { ChangePasswordInput, UpdateAccountInput, UpdateCustomerProfileInput } from '@integra/shared/auth';
import { authApi, type AuthUser } from '../api/auth.api';
import { accountApi } from '../api/account.api';
import { customersApi } from '../api/customers.api';
import { profileApi } from '../api/profile.api';
import { AuthContext, type AuthContextValue, type AuthState } from './auth-context-value';
import i18n from '../i18n';
import { readingPreferencesOf } from '../lib/reading-preferences';

function applyReadingPreferences(preferences: ReadingPreferences | undefined) {
  const root = document.documentElement;
  if (preferences && preferences.textSize !== 'default') root.dataset.textSize = preferences.textSize;
  else delete root.dataset.textSize;
  if (preferences?.highContrast) root.dataset.contrast = 'high';
  else delete root.dataset.contrast;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null, profile: null, error: null });

  const refresh = useCallback(async () => {
    setState((current) => current.status === 'authenticated'
      ? current
      : { status: 'loading', user: null, profile: null, error: null });
    try {
      const result = await authApi.me();
      const saved = await customersApi.me();
      void i18n.changeLanguage(result.user.locale);
      setState({ status: 'authenticated', ...result, profile: saved.profile, revision: saved.revision, error: null });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setState({ status: 'anonymous', user: null, profile: null, error: null });
      } else {
        setState({ status: 'unavailable', user: null, profile: null, error: 'Não foi possível ligar ao serviço. Tente novamente.' });
      }
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);

  // Reading preferences belong to the account: they apply while signed in and are never kept in the browser.
  const preferences = state.status === 'authenticated' ? readingPreferencesOf(state.user) : undefined;
  useEffect(() => {
    applyReadingPreferences(preferences);
  }, [preferences]);

  const accept = useCallback(async (result: { user: AuthUser; profile: CustomerProfileInput }) => {
    const saved = await customersApi.me();
    void i18n.changeLanguage(result.user.locale);
    setState({ status: 'authenticated', ...result, profile: saved.profile, revision: saved.revision, error: null });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    await accept(result);
    return result.user;
  }, [accept]);

  const register = useCallback(async (input: { name: string; email: string; password: string; locale: SupportedLocale; profile: CustomerProfileInput }) => {
    await authApi.register(input);
    setState({ status: 'anonymous', user: null, profile: null, error: null });
  }, []);

  const deleteAccount = useCallback(async (password: string, leave?: () => void) => {
    await accountApi.delete(password);
    // The router navigates in a transition; clearing the session in the same one keeps RequireAuth
    // from redirecting the deleted account's page before the caller's navigation lands.
    startTransition(() => {
      leave?.();
      setState({ status: 'anonymous', user: null, profile: null, error: null });
    });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setState({ status: 'anonymous', user: null, profile: null, error: null });
  }, []);

  const updateProfile = useCallback(async (profile: CustomerProfileInput) => {
    if (state.status !== 'authenticated') throw new Error('Sign in to update your profile.');
    const saved = await profileApi.updateOrganization({ organization: profile.organization, representative: profile.representative }, state.revision);
    setState(current => current.status === 'authenticated' ? { ...current, profile: saved.profile, revision: saved.revision } : current);
  }, [state]);

  const updateAccount = useCallback(async (input: UpdateAccountInput) => {
    if (state.status !== 'authenticated') throw new Error('Sign in to update your account.');
    const user = await profileApi.updateAccount(input);
    setState(current => current.status === 'authenticated'
      ? user.email !== current.user.email
        ? { status: 'anonymous', user: null, profile: null, error: null }
        : { ...current, user }
      : current);
    return user;
  }, [state]);

  const updateOrganization = useCallback(async (profile: UpdateCustomerProfileInput['profile']) => {
    if (state.status !== 'authenticated') throw new Error('Sign in to update your organization.');
    const saved = await profileApi.updateOrganization(profile, state.revision);
    setState(current => current.status === 'authenticated' ? { ...current, profile: saved.profile, revision: saved.revision } : current);
    return saved;
  }, [state]);

  const changePassword = useCallback(async (input: ChangePasswordInput) => {
    if (state.status !== 'authenticated') throw new Error('Sign in to change your password.');
    const user = await profileApi.changePassword(input);
    setState(current => current.status === 'authenticated' ? { ...current, user } : current);
  }, [state.status]);

  const updateLocale = useCallback(async (locale: import('@integra/shared/auth').SupportedLocale) => {
    if (state.status !== 'authenticated') { await i18n.changeLanguage(locale); return; }
    const user = await authApi.updateLocale(locale);
    await i18n.changeLanguage(user.locale);
    setState({ ...state, user });
  }, [state]);

  const updateReadingPreferences = useCallback(async (next: ReadingPreferences) => {
    if (state.status !== 'authenticated') throw new Error('Sign in to save reading preferences.');
    const user = await authApi.updateReadingPreferences(next);
    setState(current => current.status === 'authenticated' ? { ...current, user } : current);
  }, [state.status]);

  const acceptTerms = useCallback(async () => {
    if (state.status !== 'authenticated') throw new Error('Sign in to accept the Terms of Use.');
    const user = await authApi.acceptTerms();
    setState(current => current.status === 'authenticated' ? { ...current, user } : current);
  }, [state.status]);

  const value = useMemo<AuthContextValue>(() => ({
    ...state, refresh, retry: refresh, login, register, logout, deleteAccount, updateProfile, updateAccount, updateOrganization, changePassword, updateLocale, updateReadingPreferences, acceptTerms,
  }), [state, refresh, login, register, logout, deleteAccount, updateProfile, updateAccount, updateOrganization, changePassword, updateLocale, updateReadingPreferences, acceptTerms]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
