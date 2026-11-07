import { describe, expect, it } from 'vitest';
import { CustomersRepository } from '../src/modules/customers/customers.repository';
import { CustomersService } from '../src/modules/customers/customers.service';
import type { PrismaService } from '../src/infra/prisma/prisma.service';

const savedProfile = {
  schemaVersion: 1 as const,
  organization: { name: 'Original', nif: '123456789', sector: 'Serviços', email: 'contact@example.pt' },
  representative: { name: 'Ana Silva', email: '', phone: '' },
  selectedSystems: ['sgq', 'sga'] as const,
};

function makeService() {
  const stored = {
    data: structuredClone(savedProfile) as Record<string, unknown>,
    revision: 1,
    updatedAt: new Date('2026-10-03T12:00:00.000Z'),
  };
  const customerProfile = {
    findUnique: async ({ where }: { where: { userId: string } }) => where.userId === 'user-1' ? stored : null,
    updateMany: async ({ where, data }: {
      where: { userId: string; revision: number };
      data: { data: Record<string, unknown>; revision: { increment: number } };
    }) => {
      if (where.userId !== 'user-1' || where.revision !== stored.revision) return { count: 0 };
      stored.data = structuredClone(data.data);
      stored.revision += data.revision.increment;
      return { count: 1 };
    },
  };
  const prisma = {
    customerProfile,
    $transaction: async <T>(callback: (transaction: { customerProfile: typeof customerProfile }) => Promise<T>) =>
      callback({ customerProfile }),
  } as unknown as PrismaService;
  return { service: new CustomersService(new CustomersRepository(prisma)), stored };
}

describe('CustomersService', () => {
  it('edits contact details while retaining the saved system selection in storage and response', async () => {
    const { service, stored } = makeService();

    const result = await service.updateMe('user-1', {
      revision: 1,
      profile: {
        organization: { ...savedProfile.organization, name: 'Updated' },
        representative: { ...savedProfile.representative, name: 'Beatriz' },
      },
    });

    expect(stored.data).toEqual({
      schemaVersion: 1,
      organization: { ...savedProfile.organization, name: 'Updated' },
      representative: { ...savedProfile.representative, name: 'Beatriz' },
      selectedSystems: ['sgq', 'sga'],
    });
    expect(result.profile).toEqual(stored.data);
    expect(result.revision).toBe(2);
  });

  it('reports a revision conflict without modifying the saved profile', async () => {
    const { service, stored } = makeService();

    await expect(service.updateMe('user-1', {
      revision: 2,
      profile: { organization: { ...savedProfile.organization, name: 'Stale' }, representative: savedProfile.representative },
    })).rejects.toMatchObject({ response: { error: { code: 'PROFILE_REVISION_CONFLICT' } } });
    expect(stored.data).toEqual(savedProfile);
    expect(stored.revision).toBe(1);
  });
});
