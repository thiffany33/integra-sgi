import { describe, expect, it, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import { seedPlatformAdmin } from '../prisma/seed-platform-admin';

function fakeDatabase(existing: { id: string } | null) {
  const user = {
    findUnique: vi.fn().mockResolvedValue(existing),
    create: vi.fn().mockResolvedValue({ id: 'new-admin' }),
  };
  const database = { $transaction: vi.fn((work: (transaction: { user: typeof user }) => unknown) => work({ user })) };
  return { database: database as never, user };
}

describe('seedPlatformAdmin', () => {
  const input = { name: 'Admin', email: '  ADMIN@EXAMPLE.PT ', password: 'a-strong-admin-password' };

  it('validates required inputs before touching persistence', async () => {
    const { database, user } = fakeDatabase(null);
    await expect(seedPlatformAdmin({ ...input, name: ' ' }, database, vi.fn())).rejects.toThrow('SEED_ADMIN_NAME');
    await expect(seedPlatformAdmin({ ...input, email: 'bad' }, database, vi.fn())).rejects.toThrow('SEED_ADMIN_EMAIL');
    await expect(seedPlatformAdmin({ ...input, password: 'short' }, database, vi.fn())).rejects.toThrow('SEED_ADMIN_PASSWORD');
    expect(user.findUnique).not.toHaveBeenCalled();
  });

  it('creates a verified administrator with a profile and a hashed password', async () => {
    const { database, user } = fakeDatabase(null);
    const hashPassword = vi.fn().mockResolvedValue('argon2-hash');
    expect(await seedPlatformAdmin(input, database, hashPassword)).toEqual({ status: 'created', userId: 'new-admin' });
    expect(hashPassword).toHaveBeenCalledWith(input.password);
    expect(user.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@example.pt' }, select: { id: true } });
    expect(user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        name: 'Admin', email: 'admin@example.pt', passwordHash: 'argon2-hash', isAdmin: true,
        emailVerifiedAt: expect.any(Date),
        customerProfile: { create: { data: expect.objectContaining({ schemaVersion: 1 }) } },
      }),
    }));
  });

  it('skips an existing account without changing it', async () => {
    const { database, user } = fakeDatabase({ id: 'existing' });
    expect(await seedPlatformAdmin(input, database, vi.fn().mockResolvedValue('hash'))).toEqual({ status: 'skipped', userId: 'existing' });
    expect(user.create).not.toHaveBeenCalled();
  });

  it('fails without DATABASE_URL and never prints the password', () => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'prisma/seed-platform-admin.ts'], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 15_000,
      env: {
        ...process.env,
        DOTENV_CONFIG_PATH: '/dev/null',
        DATABASE_URL: '',
        SEED_ADMIN_NAME: 'Secret Name',
        SEED_ADMIN_EMAIL: 'secret@example.pt',
        SEED_ADMIN_PASSWORD: 'a-secret-password-that-must-not-leak',
      },
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr.trim()).toBe('DATABASE_URL is required.');
    expect(`${result.stdout}${result.stderr}`).not.toContain('a-secret-password-that-must-not-leak');
  });
});
