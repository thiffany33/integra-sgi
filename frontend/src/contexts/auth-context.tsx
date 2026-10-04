import axios from 'axios';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CustomerProfileInput } from '@integra/shared/profile';
import type { SupportedLocale } from '@integra/shared/auth';
import type { ChangePasswordInput, UpdateAccountInput, UpdateCustomerProfileInput } from '@integra/shared/auth';
import { authApi, type AuthUser } from '../api/auth.api';
import { customersApi } from '../api/customers.api';
import { profileApi } from '../api/profile.api';
import { AuthContext, type AuthContextValue, type AuthState } from './auth-context-value';
import i18n from '../i18n';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null, profile: null, error: null });

  const refresh = useCallback(async () => {
    setState((current) => current.status === 'authenticated'
      ? current
      : { status: 'loading', user: null, profile: null, error: null });
    try {
      const result = await authApi.me();
      void i18n.changeLanguage(result.user.locale);
      setState({ status: 'authenticated', ...result, revision: (await customersApi.me()).revision, error: null });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setState({ status: 'anonymous', user: null, profile: null, error: null });
      } else {
        setState({ status: 'unavailable', user: null, profile: null, error: 'Não foi possível ligar ao serviço. Tente novamente.' });
      }
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);

  const accept = useCallback(async (result: { user: AuthUser; profile: CustomerProfileInput }) => {
    const saved = await customersApi.me();
    void i18n.changeLanguage(result.user.locale);
    setState({ status: 'authenticated', ...result, revision: saved.revision, error: null });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await accept(await authApi.login(email, password));
  }, [accept]);

  const register = useCallback(async (input: { name: string; email: string; password: string; locale: SupportedLocale; profile: CustomerProfileInput }) => {
    await accept(await authApi.register(input));
  }, [accept]);

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
    setState(current => current.status === 'authenticated' ? { ...current, user } : current);
  }, [state.status]);

  const updateOrganization = useCallback(async (profile: UpdateCustomerProfileInput['profile']) => {
    if (state.status !== 'authenticated') throw new Error('Sign in to update your organization.');
    const saved = await profileApi.updateOrganization(profile, state.revision);
    setState(current => current.status === 'authenticated' ? { ...current, profile: saved.profile, revision: saved.revision } : current);
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

  const value = useMemo<AuthContextValue>(() => ({
    ...state, refresh, retry: refresh, login, register, logout, updateProfile, updateAccount, updateOrganization, changePassword, updateLocale,
  }), [state, refresh, login, register, logout, updateProfile, updateAccount, updateOrganization, changePassword, updateLocale]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
