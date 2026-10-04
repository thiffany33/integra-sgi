import { HttpStatus, Injectable } from '@nestjs/common';
import { customerProfileSchema } from '@integra/shared/profile';
import { ApiException } from '../../utils/api-exception';
import { RequirementsRepository } from './requirements.repository';

const sharedRequirements = ['/requirement4', '/requirement5', '/requirement6', '/requirement7'] as const;
const systemRequirements = {
  sgq: { key: 'sgq', route: '/requirement6_1_quality' },
  sga: { key: 'sga', route: '/requirement6_1_environment' },
  sgsst: { key: 'sgsst', route: '/requirement6_1_sst' },
} as const;

@Injectable()
export class RequirementsService {
  constructor(private readonly repository: RequirementsRepository) {}

  async listForUser(userId: string) {
    const record = await this.repository.findCustomerProfile(userId);
    const profile = record && customerProfileSchema.safeParse(record.data);
    if (!profile || !profile.success) {
      throw new ApiException(HttpStatus.NOT_FOUND, {
        code: 'PROFILE_NOT_FOUND', message: 'A customer profile is required to load tailored guidance.',
      });
    }
    const selectedSystems = profile.data.selectedSystems;
    return {
      selectedSystems,
      commonRequirements: [...sharedRequirements],
      specializedRequirements: selectedSystems.map((system) => systemRequirements[system]),
    };
  }
}
