import { describe, expect, it, vi } from 'vitest';
import { AdminService } from '../src/modules/admin/admin.service';
import { AdminRepository } from '../src/modules/admin/admin.repository';

describe('AdminService', () => {
  it('returns a limited page without customer secrets', async () => {
    const list = vi.fn().mockResolvedValue({ items: [], nextCursor: null });
    const service = new AdminService({ listCustomers: list } as unknown as AdminRepository);
    expect(await service.listCustomers({ search: 'ana', limit: 100 })).toEqual({ items: [], nextCursor: null });
    expect(list).toHaveBeenCalledWith({ search: 'ana', limit: 50, cursor: undefined });
  });

  it('maps missing customers and stale revisions to safe errors', async () => {
    const repository = { updateCustomerSystems: vi.fn().mockResolvedValueOnce('NOT_FOUND').mockResolvedValueOnce('CONFLICT') };
    const service = new AdminService(repository as unknown as AdminRepository);
    const input = { selectedSystems: ['sgq'] as const, revision: 1 };
    await expect(service.updateCustomerSystems('actor', 'missing', input)).rejects.toMatchObject({
      response: { error: { code: 'CUSTOMER_NOT_FOUND' } },
    });
    await expect(service.updateCustomerSystems('actor', 'customer', input)).rejects.toMatchObject({
      response: { error: { code: 'PROFILE_REVISION_CONFLICT' } },
    });
  });
});
