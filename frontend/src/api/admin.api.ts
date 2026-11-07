import type { SelectedSystem } from '@integra/shared/profile';
import { api } from '../lib/api';

export type AdminCustomer = {
  userId: string;
  name: string;
  email: string;
  organizationName: string;
  selectedSystems: SelectedSystem[];
  revision: number;
  updatedAt: string;
};

export type AdminCustomerPage = { items: AdminCustomer[]; nextCursor: string | null };

export const adminApi = {
  async searchCustomers(search = '', cursor?: string): Promise<AdminCustomerPage> {
    const { data } = await api.get<AdminCustomerPage>('/admin/customers', { params: { search: search || undefined, cursor } });
    return data;
  },
  async updateCustomerSystems(userId: string, selectedSystems: SelectedSystem[], revision: number): Promise<AdminCustomer> {
    const { data } = await api.patch<AdminCustomer>(`/admin/customers/${encodeURIComponent(userId)}/systems`, { selectedSystems, revision });
    return data;
  },
};
