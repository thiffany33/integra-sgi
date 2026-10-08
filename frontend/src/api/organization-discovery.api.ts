import type {
  OrganizationDiscoverySaveStep,
  OrganizationDiscoveryState,
  OrganizationDiscoveryStep1Answers,
  OrganizationDiscoveryStep2Answers,
  OrganizationDiscoveryStep3Answers,
  OrganizationDiscoveryStep4Answers,
  OrganizationDiscoveryStep5Answers,
} from '@integra/shared/requirements';
import { api } from '../lib/api';

export type DiscoveryAnswers = {
  1: OrganizationDiscoveryStep1Answers;
  2: OrganizationDiscoveryStep2Answers;
  3: OrganizationDiscoveryStep3Answers;
  4: OrganizationDiscoveryStep4Answers;
  5: OrganizationDiscoveryStep5Answers;
};

const path = '/guided-flows/organization-discovery';

export const organizationDiscoveryApi = {
  async get(): Promise<OrganizationDiscoveryState> {
    const { data } = await api.get<OrganizationDiscoveryState>(path);
    return data;
  },
  async saveStep<T extends OrganizationDiscoverySaveStep>(step: T, revision: number, answers: DiscoveryAnswers[T]): Promise<OrganizationDiscoveryState> {
    const { data } = await api.put<OrganizationDiscoveryState>(`${path}/steps/${step}`, { revision, answers });
    return data;
  },
  async complete(revision: number): Promise<OrganizationDiscoveryState> {
    const { data } = await api.post<OrganizationDiscoveryState>(`${path}/complete`, { revision });
    return data;
  },
};
