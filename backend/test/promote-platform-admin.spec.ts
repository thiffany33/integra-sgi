import { describe, expect, it, vi } from 'vitest';
import { promotePlatformAdmin } from '../prisma/promote-platform-admin';

describe('promotePlatformAdmin', () => {
  it('requires a valid email and an existing account', async () => {
    const prisma = { user: { findUnique: vi.fn().mockResolvedValue(null), update: vi.fn() } };
    await expect(promotePlatformAdmin(undefined, prisma)).rejects.toThrow('PLATFORM_ADMIN_EMAIL');
    await expect(promotePlatformAdmin('invalid', prisma)).rejects.toThrow('PLATFORM_ADMIN_EMAIL');
    await expect(promotePlatformAdmin('missing@example.pt', prisma)).rejects.toThrow('existing account');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('normalizes the address and promotes only the matched account', async () => {
    const prisma = { user: { findUnique: vi.fn().mockResolvedValue({ id: 'user-1' }), update: vi.fn().mockResolvedValue({ id: 'user-1' }) } };
    await promotePlatformAdmin('  ADMIN@EXAMPLE.PT ', prisma);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@example.pt' }, select: { id: true } });
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: { role: 'PLATFORM_ADMIN' }, select: { id: true } });
  });
});
