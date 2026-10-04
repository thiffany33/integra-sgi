import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../src/modules/auth/auth.service';
import { AuthRepository } from '../src/modules/auth/auth.repository';
import { AuthRateLimitService } from '../src/modules/auth/auth-rate-limit.service';
import { PasswordHashingService } from '../src/modules/auth/password-hashing.service';
import { AuthEmailService } from '../src/modules/auth/auth-email.service';

const profile = {
  schemaVersion: 1 as const,
  organization: { name: 'Integra', nif: '123', sector: 'Serviços', email: 'contact@example.pt' },
  representative: { name: 'Ana Silva', email: '', phone: '' },
  selectedSystems: ['sgq' as const],
};

const publicUser = {
  id: 'user-1',
  name: 'Ana Silva',
  email: 'ana@example.pt',
  locale: 'pt-PT',
  emailVerifiedAt: null,
};

function makeService() {
  const repository = {
    findUserByEmail: vi.fn().mockResolvedValue(null),
    createUserWithProfileAndSession: vi.fn().mockResolvedValue({ user: publicUser, profile }),
    findUserForLogin: vi.fn(),
    createSession: vi.fn(),
    findSessionByTokenHash: vi.fn(),
    revokeSession: vi.fn(),
    getUserProfile: vi.fn(),
    updateAccount: vi.fn(),
    findUserPassword: vi.fn(),
    rotatePasswordAndSession: vi.fn(),
  };
  const passwords = {
    hash: vi.fn().mockResolvedValue('$argon2id$hashed-value'),
    verify: vi.fn().mockResolvedValue(true),
  };
  const rateLimit = { consume: vi.fn().mockResolvedValue(undefined) };
  const authEmail = {
    sendVerification: vi.fn().mockResolvedValue(undefined),
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    verifyEmail: vi.fn().mockResolvedValue(true),
  };
  const service = new AuthService(
    repository as unknown as AuthRepository,
    passwords as unknown as PasswordHashingService,
    rateLimit as unknown as AuthRateLimitService,
    authEmail as unknown as AuthEmailService,
  );

  return { service, repository, passwords, rateLimit, authEmail };
}

describe('AuthService', () => {
  it('normalizes email, hashes the password, and stores only a session hash on registration', async () => {
    const { service, repository, passwords, rateLimit, authEmail } = makeService();

    const result = await service.register({
      name: 'Ana Silva',
      email: ' ANA@EXAMPLE.PT ',
      password: 'correct-horse-battery-staple',
      locale: 'pt-PT',
      profile,
    }, '127.0.0.1');

    const [created] = repository.createUserWithProfileAndSession.mock.calls[0] as [Record<string, unknown>];
    expect(rateLimit.consume).toHaveBeenCalledWith('register', '127.0.0.1', 'ana@example.pt', 5, 3600);
    expect(passwords.hash).toHaveBeenCalledWith('correct-horse-battery-staple');
    expect(created.email).toBe('ana@example.pt');
    expect(created.passwordHash).toBe('$argon2id$hashed-value');
    expect(created.passwordHash).not.toBe('correct-horse-battery-staple');
    expect(created.tokenHash).toBe(createHash('sha256').update(result.sessionToken).digest('hex'));
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result).toHaveProperty('profile', profile);
    expect(authEmail.sendVerification).toHaveBeenCalledWith('user-1', 'ana@example.pt', 'pt-PT');
  });

  it('uses the same invalid-credentials error for an incorrect password', async () => {
    const { service, repository, passwords } = makeService();
    passwords.verify.mockResolvedValue(false);
    repository.findUserForLogin.mockResolvedValue({
      user: publicUser,
      passwordHash: '$argon2id$stored-hash',
      profile,
    });

    await expect(service.login({ email: 'ANA@EXAMPLE.PT', password: 'wrong-password' }, '127.0.0.1'))
      .rejects.toMatchObject({
        response: { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } },
      });
    expect(repository.createSession).not.toHaveBeenCalled();
  });

  it('normalizes account details and resends verification only when the email changes', async () => {
    const { service, repository, authEmail } = makeService();
    repository.updateAccount.mockResolvedValue({ user: { ...publicUser, name: 'Ana Maria', email: 'new@example.pt', emailVerifiedAt: null }, emailChanged: true });

    const result = await service.updateAccount('user-1', { name: ' Ana Maria ', email: ' NEW@EXAMPLE.PT ' });

    expect(repository.updateAccount).toHaveBeenCalledWith('user-1', { name: 'Ana Maria', email: 'new@example.pt' });
    expect(result.user).toEqual({ ...publicUser, name: 'Ana Maria', email: 'new@example.pt', emailVerifiedAt: null });
    expect(authEmail.sendVerification).toHaveBeenCalledWith('user-1', 'new@example.pt', 'pt-PT');
    repository.updateAccount.mockResolvedValue({ user: publicUser, emailChanged: false });
    await service.updateAccount('user-1', { name: 'Ana Silva', email: 'ana@example.pt' });
    expect(authEmail.sendVerification).toHaveBeenCalledTimes(1);
  });

  it('returns a conflict when an account email is already in use', async () => {
    const { service, repository } = makeService();
    repository.updateAccount.mockRejectedValue({ code: 'P2002' });
    await expect(service.updateAccount('user-1', { name: 'Ana', email: 'taken@example.pt' }))
      .rejects.toMatchObject({ response: { error: { code: 'EMAIL_ALREADY_EXISTS' } } });
  });

  it('rejects a wrong current password without rotating sessions', async () => {
    const { service, repository, passwords } = makeService();
    repository.findUserPassword.mockResolvedValue({ ...publicUser, passwordHash: '$argon2id$stored-hash' });
    passwords.verify.mockResolvedValue(false);
    await expect(service.changePassword('user-1', 'current-token', {
      currentPassword: 'wrong-password', newPassword: 'correct-horse-battery',
    })).rejects.toMatchObject({ response: { error: { code: 'INVALID_CURRENT_PASSWORD' } } });
    expect(repository.rotatePasswordAndSession).not.toHaveBeenCalled();
  });

  it('hashes the new password and returns a new raw session token only to the controller', async () => {
    const { service, repository, passwords } = makeService();
    repository.findUserPassword.mockResolvedValue({ ...publicUser, passwordHash: '$argon2id$stored-hash' });
    repository.rotatePasswordAndSession.mockResolvedValue(publicUser);
    const result = await service.changePassword('user-1', 'current-token', {
      currentPassword: 'old-password', newPassword: 'correct-horse-battery',
    });
    const [input] = repository.rotatePasswordAndSession.mock.calls[0] as [Record<string, unknown>];
    expect(passwords.verify).toHaveBeenCalledWith('$argon2id$stored-hash', 'old-password');
    expect(passwords.hash).toHaveBeenCalledWith('correct-horse-battery');
    expect(input.passwordHash).toBe('$argon2id$hashed-value');
    expect(input.currentTokenHash).toBe(createHash('sha256').update('current-token').digest('hex'));
    expect(input.newTokenHash).toBe(createHash('sha256').update(result.sessionToken).digest('hex'));
    expect(result.sessionToken).not.toBe('current-token');
    expect(result.user).toEqual(publicUser);
    expect(result.user).not.toHaveProperty('passwordHash');
  });
});
