import { describe, expect, it, vi } from 'vitest';
import { CustomersRepository } from '../src/modules/customers/customers.repository';
import type { PrismaService } from '../src/infra/prisma/prisma.service';

describe('CustomersRepository avatar compare-and-swap', () => {
  it('updates only the profile row that still has the expected key', async () => {
    const updateMany = vi.fn(async () => ({ count: 1 }));
    const repository = new CustomersRepository({ customerProfile: { updateMany } } as unknown as PrismaService);

    const updated = await repository.compareAndSwapAvatarObjectKey(
      'user-1', 'avatars/user-1/old.png', 'avatars/user-1/new.png',
    );

    expect(updated).toBe(true);
    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', avatarObjectKey: 'avatars/user-1/old.png' },
      data: { avatarObjectKey: 'avatars/user-1/new.png' },
    });
  });

  it('reports a lost race when the expected key no longer matches', async () => {
    const updateMany = vi.fn(async () => ({ count: 0 }));
    const repository = new CustomersRepository({ customerProfile: { updateMany } } as unknown as PrismaService);

    await expect(repository.compareAndSwapAvatarObjectKey('user-1', null, 'avatars/user-1/new.png')).resolves.toBe(false);
    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', avatarObjectKey: null },
      data: { avatarObjectKey: 'avatars/user-1/new.png' },
    });
  });
});
