import { api } from '../lib/api';

export type RequirementsForUser = {
  selectedSystems: Array<'sgq' | 'sga' | 'sgsst'>;
  commonRequirements: string[];
  specializedRequirements: Array<{ key: 'sgq' | 'sga' | 'sgsst'; route: string }>;
};

export const requirementsApi = {
  async listForCurrentUser(): Promise<RequirementsForUser> {
    const { data } = await api.get<RequirementsForUser>('/requirements');
    return data;
  },
};
