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

export type InsightCount = { value: string; count: number };

export type AdminInsights = {
  generatedAt: string;
  funnel: { registered: number; emailVerified: number; discoveryStarted: number; discoveryCompleted: number };
  stoppedAtStep: InsightCount[];
  registrationsByMonth: InsightCount[];
  answered: { organization: number; activity: number; processes: number; attention: number };
  selectedSystems: InsightCount[];
  sectors: InsightCount[];
  workforceRanges: InsightCount[];
  activityTypes: InsightCount[];
  customerTypes: InsightCount[];
  operatingAreas: InsightCount[];
  processActivities: InsightCount[];
  attentionTopics: InsightCount[];
};

export type AdminCustomerPage = { items: AdminCustomer[]; nextCursor: string | null };

export const adminApi = {
  async searchCustomers(search = '', cursor?: string): Promise<AdminCustomerPage> {
    const { data } = await api.get<AdminCustomerPage>('/admin/customers', { params: { search: search || undefined, cursor } });
    return data;
  },
  async insights(): Promise<AdminInsights> {
    const { data } = await api.get<AdminInsights>('/admin/insights');
    return data;
  },
  async updateCustomerSystems(userId: string, selectedSystems: SelectedSystem[], revision: number): Promise<AdminCustomer> {
    const { data } = await api.patch<AdminCustomer>(`/admin/customers/${encodeURIComponent(userId)}/systems`, { selectedSystems, revision });
    return data;
  },
};
