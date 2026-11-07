import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../../utils/api-exception';
import { AdminRepository } from './admin.repository';
import type { ListCustomersInput, UpdateCustomerSystemsInput } from './admin.schema';

@Injectable()
export class AdminService {
  constructor(private readonly repository: AdminRepository) {}

  async listCustomers(input: Partial<ListCustomersInput>) {
    const result = await this.repository.listCustomers({
      search: input.search,
      cursor: input.cursor,
      limit: Math.min(input.limit ?? 20, 50),
    });
    if (result === 'INVALID_CURSOR') {
      throw new ApiException(HttpStatus.BAD_REQUEST, { code: 'INVALID_CURSOR', message: 'Invalid customer cursor.' });
    }
    return result;
  }

  async updateCustomerSystems(actorUserId: string, targetUserId: string, input: UpdateCustomerSystemsInput) {
    const result = await this.repository.updateCustomerSystems(actorUserId, targetUserId, [...input.selectedSystems], input.revision);
    if (result === 'NOT_FOUND') {
      throw new ApiException(HttpStatus.NOT_FOUND, { code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found.' });
    }
    if (result === 'CONFLICT') {
      throw new ApiException(HttpStatus.CONFLICT, {
        code: 'PROFILE_REVISION_CONFLICT', message: 'This profile changed elsewhere. Reload it and try again.',
      });
    }
    return result;
  }
}
