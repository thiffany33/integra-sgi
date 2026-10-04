import type { CustomerProfileInput } from '@integra/shared/profile';
import type { SupportedLocale, UserRole } from '@integra/shared/auth';
import { api } from '../lib/api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  locale: SupportedLocale;
  emailVerifiedAt: string | null;
  role: UserRole;
};

export type AuthPayload = { user: AuthUser; profile: CustomerProfileInput };

export const authApi = {
  async me(): Promise<AuthPayload> {
    const { data } = await api.get<AuthPayload>('/auth/me');
    return data;
  },
  async login(email: string, password: string): Promise<AuthPayload> {
    const { data } = await api.post<AuthPayload>('/auth/login', { email, password });
    return data;
  },
  async register(input: {
    name: string;
    email: string;
    password: string;
    locale: SupportedLocale;
    profile: CustomerProfileInput;
  }): Promise<AuthPayload> {
    const { data } = await api.post<AuthPayload>('/auth/register', input);
    return data;
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },
  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },
  async updateLocale(locale: SupportedLocale): Promise<AuthUser> {
    const { data } = await api.patch<{ user: AuthUser }>('/auth/me/locale', { locale });
    return data.user;
  },
};
