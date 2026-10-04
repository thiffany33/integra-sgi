import { HttpStatus, Injectable } from '@nestjs/common';
import type { UpdateCustomerProfileInput } from '@integra/shared/auth';
import { ApiException } from '../../utils/api-exception';
import { CustomersRepository } from './customers.repository';

@Injectable()
export class CustomersService {
  constructor(private readonly repository: CustomersRepository) {}

  async getMe(userId: string) {
    const profile = await this.repository.getProfile(userId);
    if (!profile) throw this.notFound();
    return { profile: profile.data, revision: profile.revision, updatedAt: profile.updatedAt };
  }

  async updateMe(userId: string, input: UpdateCustomerProfileInput) {
    const profile = await this.repository.updateProfile(userId, input.revision, input.profile);
    if (!profile) {
      throw new ApiException(HttpStatus.CONFLICT, {
        code: 'PROFILE_REVISION_CONFLICT',
        message: 'This profile changed elsewhere. Reload it and try again.',
      });
    }
    return { profile: profile.data, revision: profile.revision, updatedAt: profile.updatedAt };
  }

  private notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, { code: 'PROFILE_NOT_FOUND', message: 'Customer profile not found.' });
  }
}
