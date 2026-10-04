import { createHash, randomBytes } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import type { CustomerProfileInput } from '@integra/shared/profile';
import type { ChangePasswordInput, RegisterInput, SupportedLocale, UpdateAccountInput, UserRole } from '@integra/shared/auth';
import { changePasswordSchema, loginSchema, registerSchema, supportedLocales, updateAccountSchema } from '@integra/shared/auth';
import { ApiException } from '../../utils/api-exception';
import { AuthRateLimitService } from './auth-rate-limit.service';
import { AuthRepository, type PublicUserRecord } from './auth.repository';
import { PasswordHashingService } from './password-hashing.service';
import { SESSION_TTL_SECONDS } from './session-cookie';
import { AuthEmailService } from './auth-email.service';

export type PublicAuthUser = {
  id: string;
  name: string;
  email: string;
  locale: SupportedLocale;
  emailVerifiedAt: Date | null;
  role: UserRole;
};

export type AuthResult = {
  user: PublicAuthUser;
  profile: CustomerProfileInput;
  sessionToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly passwords: PasswordHashingService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly authEmail: AuthEmailService,
  ) {}

  async register(input: RegisterInput, ipAddress?: string): Promise<AuthResult> {
    const registration = registerSchema.parse(input);
    await this.rateLimit.consume('register', ipAddress, registration.email, 5, 3600);

    if (await this.repository.findUserByEmail(registration.email)) {
      throw new ApiException(HttpStatus.CONFLICT, {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await this.passwords.hash(registration.password);
    const sessionToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

    try {
      const created = await this.repository.createUserWithProfileAndSession({
        name: registration.name,
        email: registration.email,
        passwordHash,
        locale: registration.locale,
        profile: registration.profile,
        tokenHash: this.hashSessionToken(sessionToken),
        expiresAt,
      });
      await this.authEmail.sendVerification(created.user.id, created.user.email, created.user.locale);
      return {
        user: this.publicUser(created.user),
        profile: created.profile as CustomerProfileInput,
        sessionToken,
      };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ApiException(HttpStatus.CONFLICT, {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email already exists.',
        });
      }
      throw error;
    }
  }

  async login(input: { email: string; password: string }, ipAddress?: string): Promise<AuthResult> {
    const credentials = loginSchema.parse(input);
    await this.rateLimit.consume('login', ipAddress, credentials.email, 10, 900);

    const found = await this.repository.findUserForLogin(credentials.email);
    if (!found || !(await this.passwords.verify(found.passwordHash, credentials.password)) || !found.profile) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    const sessionToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
    await this.repository.createSession(
      found.user.id,
      this.hashSessionToken(sessionToken),
      expiresAt,
    );

    return {
      user: this.publicUser(found.user),
      profile: found.profile as CustomerProfileInput,
      sessionToken,
    };
  }

  async logout(sessionToken?: string): Promise<void> {
    if (!sessionToken) return;
    await this.repository.revokeSession(this.hashSessionToken(sessionToken), new Date());
  }

  async validateSession(sessionToken: string): Promise<{ userId: string; role: UserRole } | null> {
    const session = await this.repository.findSessionByTokenHash(this.hashSessionToken(sessionToken));
    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) return null;
    return { userId: session.userId, role: session.role };
  }

  async getMe(userId: string): Promise<{ user: PublicAuthUser; profile: CustomerProfileInput }> {
    const found = await this.repository.getUserProfile(userId);
    if (!found) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, {
        code: 'UNAUTHENTICATED',
        message: 'Please sign in to continue.',
      });
    }
    return {
      user: this.publicUser(found.user),
      profile: found.profile as CustomerProfileInput,
    };
  }

  async forgotPassword(email: string, ipAddress?: string): Promise<{ message: string }> {
    const normalizedEmail = loginSchema.shape.email.parse(email);
    await this.rateLimit.consume('forgot-password', ipAddress, normalizedEmail, 5, 3600);
    await this.authEmail.requestPasswordReset(normalizedEmail);
    return { message: 'If this email exists, password recovery instructions have been sent.' };
  }

  async resetPassword(token: string, password: string, ipAddress?: string): Promise<{ message: string }> {
    const tokenHash = this.hashSessionToken(token);
    await this.rateLimit.consume('reset-password', ipAddress, tokenHash, 5, 3600);
    const passwordHash = await this.passwords.hash(password);
    if (!(await this.repository.resetPassword(tokenHash, passwordHash, new Date()))) {
      throw new ApiException(HttpStatus.BAD_REQUEST, {
        code: 'INVALID_RESET_TOKEN', message: 'This password reset link is invalid or has expired.',
      });
    }
    return { message: 'Password updated. Please sign in again.' };
  }

  async verifyEmail(token: string, ipAddress?: string): Promise<{ message: string }> {
    const tokenHash = this.hashSessionToken(token);
    await this.rateLimit.consume('verify-email', ipAddress, tokenHash, 10, 3600);
    if (!(await this.authEmail.verifyEmail(token))) {
      throw new ApiException(HttpStatus.BAD_REQUEST, {
        code: 'INVALID_VERIFICATION_TOKEN', message: 'This email verification link is invalid or has expired.',
      });
    }
    return { message: 'Email address verified.' };
  }

  async updateLocale(userId: string, locale: SupportedLocale): Promise<{ user: PublicAuthUser }> {
    const user = await this.repository.updateLocale(userId, locale);
    if (!user) {
      throw new ApiException(HttpStatus.NOT_FOUND, { code: 'USER_NOT_FOUND', message: 'User account not found.' });
    }
    return { user: this.publicUser(user) };
  }

  async updateAccount(userId: string, input: UpdateAccountInput): Promise<{ user: PublicAuthUser }> {
    const details = updateAccountSchema.parse(input);
    const verification = this.authEmail.prepareVerification();
    try {
      const updated = await this.repository.updateAccount(userId, details, {
        tokenHash: verification.tokenHash,
        expiresAt: verification.expiresAt,
      });
      if (!updated) {
        throw new ApiException(HttpStatus.NOT_FOUND, { code: 'USER_NOT_FOUND', message: 'User account not found.' });
      }
      if (updated.emailChanged) {
        await this.authEmail.sendPreparedVerification(updated.user.email, updated.user.locale, verification.token);
      }
      return { user: this.publicUser(updated.user) };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ApiException(HttpStatus.CONFLICT, {
          code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists.',
        });
      }
      throw error;
    }
  }

  async changePassword(userId: string, currentSessionToken: string, input: ChangePasswordInput): Promise<{ user: PublicAuthUser; sessionToken: string }> {
    const passwords = changePasswordSchema.parse(input);
    const current = await this.repository.findUserPassword(userId);
    if (!current || !(await this.passwords.verify(current.passwordHash, passwords.currentPassword))) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, {
        code: 'INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect.',
      });
    }
    const sessionToken = randomBytes(32).toString('base64url');
    const now = new Date();
    const updated = await this.repository.rotatePasswordAndSession({
      userId,
      previousPasswordHash: current.passwordHash,
      passwordHash: await this.passwords.hash(passwords.newPassword),
      currentTokenHash: this.hashSessionToken(currentSessionToken),
      newTokenHash: this.hashSessionToken(sessionToken),
      expiresAt: new Date(now.getTime() + SESSION_TTL_SECONDS * 1000),
      now,
    });
    if (!updated) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, {
        code: 'UNAUTHENTICATED', message: 'Please sign in to continue.',
      });
    }
    return { user: this.publicUser(updated), sessionToken };
  }

  private hashSessionToken(sessionToken: string): string {
    return createHash('sha256').update(sessionToken).digest('hex');
  }

  private publicUser(user: PublicUserRecord): PublicAuthUser {
    const locale = supportedLocales.includes(user.locale as SupportedLocale)
      ? (user.locale as SupportedLocale)
      : 'pt-PT';
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      locale,
      emailVerifiedAt: user.emailVerifiedAt,
      role: user.role,
    };
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
  }
}
