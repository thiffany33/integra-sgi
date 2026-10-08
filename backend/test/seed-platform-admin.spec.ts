import { describe, expect, it, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import { seedPlatformAdmin } from '../prisma/seed-platform-admin';

describe('seedPlatformAdmin', () => {
  const input = {
    appEnv: 'development',
    name: 'Local Admin',
    email: '  ADMIN@EXAMPLE.PT ',
    password: 'a-strong-local-password',
  };

  it.each(['test', 'homolog', 'production', undefined])('refuses APP_ENV=%s before touching persistence', async (appEnv) => {
    const database = { user: { upsert: vi.fn() }, customerProfile: { upsert: vi.fn() } };
    const hashPassword = vi.fn();
    await expect(seedPlatformAdmin({ ...input, appEnv }, database, hashPassword)).rejects.toThrow('APP_ENV=development');
    expect(database.user.upsert).not.toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it('validates required inputs and does not touch persistence for invalid values', async () => {
    const database = { user: { upsert: vi.fn() }, customerProfile: { upsert: vi.fn() } };
    await expect(seedPlatformAdmin({ ...input, email: 'bad' }, database, vi.fn())).rejects.toThrow('SEED_ADMIN_EMAIL');
    await expect(seedPlatformAdmin({ ...input, password: 'short' }, database, vi.fn())).rejects.toThrow('SEED_ADMIN_PASSWORD');
    expect(database.user.upsert).not.toHaveBeenCalled();
  });

  it('upserts a verified platform administrator and profile using a hashed password', async () => {
    const user = { id: 'local-admin' };
    const database = {
      user: { upsert: vi.fn().mockResolvedValue(user) },
      customerProfile: { upsert: vi.fn().mockResolvedValue({ id: 'profile' }) },
    };
    const hashPassword = vi.fn().mockResolvedValue('argon2-hash');

    await seedPlatformAdmin(input, database, hashPassword);

    expect(hashPassword).toHaveBeenCalledWith(input.password);
    expect(database.user.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { email: 'admin@example.pt' },
      create: expect.objectContaining({
        name: 'Local Admin', email: 'admin@example.pt', passwordHash: 'argon2-hash',
        role: 'PLATFORM_ADMIN', emailVerifiedAt: expect.any(Date),
      }),
      update: expect.objectContaining({
        name: 'Local Admin', passwordHash: 'argon2-hash', role: 'PLATFORM_ADMIN',
        emailVerifiedAt: expect.any(Date),
      }),
    }));
    expect(database.customerProfile.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: user.id },
      create: expect.objectContaining({ userId: user.id, data: expect.objectContaining({ schemaVersion: 1 }) }),
      update: {},
    }));
  });

  it('refuses a non-development CLI environment before attempting a database connection', () => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'prisma/seed-platform-admin.ts'], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 15_000,
      env: {
        ...process.env,
        APP_ENV: 'production',
        DATABASE_URL: '',
        SEED_ADMIN_NAME: 'Secret Name',
        SEED_ADMIN_EMAIL: 'secret@example.pt',
        SEED_ADMIN_PASSWORD: 'a-secret-password-that-must-not-leak',
      },
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr.trim()).toBe('The platform administrator seed can only run with APP_ENV=development.');
    expect(result.stderr).not.toContain('a-secret-password-that-must-not-leak');
  });
});
