import type { CustomerProfileInput } from '@integra/shared/profile';
import { api } from '../lib/api';

export type CustomerProfile = { profile: CustomerProfileInput; revision: number; updatedAt: string };

export const customersApi = {
  async me(): Promise<CustomerProfile> {
    const { data } = await api.get<CustomerProfile>('/customers/me');
    return data;
  },
  async update(profile: CustomerProfileInput, revision: number): Promise<CustomerProfile> {
    const { data } = await api.put<CustomerProfile>('/customers/me', { profile, revision });
    return data;
  },
};
