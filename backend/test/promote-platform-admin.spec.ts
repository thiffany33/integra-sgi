import { spawnSync } from 'node:child_process';
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

  it('does not print database connection details when the promotion command fails unexpectedly', () => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'prisma/promote-platform-admin.ts'], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 15_000,
      env: {
        ...process.env,
        DATABASE_URL: 'postgresql://private-user:private-password@127.0.0.1:1/private?connect_timeout=1',
        PLATFORM_ADMIN_EMAIL: 'admin@example.pt',
      },
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr.trim()).toBe('Promotion failed.');
  });

  it('keeps the actionable message for an invalid promotion email', () => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'prisma/promote-platform-admin.ts'], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 15_000,
      env: { ...process.env, DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/integra_sgi', PLATFORM_ADMIN_EMAIL: 'invalid' },
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr.trim()).toBe('PLATFORM_ADMIN_EMAIL must contain a valid email address.');
  });
});
