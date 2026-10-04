import { createContext, useContext } from 'react';
import type { CustomerProfileInput } from '@integra/shared/profile';
import type { ChangePasswordInput, SupportedLocale, UpdateAccountInput, UpdateCustomerProfileInput } from '@integra/shared/auth';
import type { AuthUser } from '../api/auth.api';

export type AuthState =
  | { status: 'loading'; user: null; profile: null; error: null }
  | { status: 'anonymous'; user: null; profile: null; error: null }
  | { status: 'unavailable'; user: null; profile: null; error: string }
  | { status: 'authenticated'; user: AuthUser; profile: CustomerProfileInput; revision: number; error: null };

export type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; locale: SupportedLocale; profile: CustomerProfileInput }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: CustomerProfileInput) => Promise<void>;
  updateAccount: (input: UpdateAccountInput) => Promise<void>;
  updateOrganization: (profile: UpdateCustomerProfileInput['profile']) => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  updateLocale: (locale: SupportedLocale) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider is required.');
  return context;
}
