import type { ChangePasswordInput, UpdateAccountInput, UpdateCustomerProfileInput } from '@integra/shared/auth';
import type { AuthUser } from './auth.api';
import type { CustomerProfile } from './customers.api';
import { api } from '../lib/api';

export const profileApi = {
  async updateAccount(input: UpdateAccountInput): Promise<AuthUser> {
    const { data } = await api.patch<{ user: AuthUser }>('/auth/me', input);
    return data.user;
  },
  async updateOrganization(profile: UpdateCustomerProfileInput['profile'], revision: number): Promise<CustomerProfile> {
    const { data } = await api.put<CustomerProfile>('/customers/me', { profile, revision });
    return data;
  },
  async changePassword(input: ChangePasswordInput): Promise<AuthUser> {
    const { data } = await api.post<{ user: AuthUser }>('/auth/me/password', input);
    return data.user;
  },
};
