import { Injectable } from '@nestjs/common';
import type { CustomerProfileInput } from '@integra/shared/profile';
import type { SupportedLocale, UpdateAccountInput } from '@integra/shared/auth';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  locale: true,
  emailVerifiedAt: true,
} as const;

export type PublicUserRecord = {
  id: string;
  name: string;
  email: string;
  locale: string;
  emailVerifiedAt: Date | null;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    return user !== null;
  }

  async createUserWithProfileAndSession(input: {
    name: string;
    email: string;
    passwordHash: string;
    locale: SupportedLocale;
    profile: CustomerProfileInput;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<{ user: PublicUserRecord; profile: Prisma.JsonValue }> {
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
          locale: input.locale,
        },
        select: publicUserSelect,
      });
      const profile = await transaction.customerProfile.create({
        data: {
          userId: user.id,
          data: input.profile as Prisma.InputJsonValue,
        },
        select: { data: true },
      });
      await transaction.session.create({
        data: {
          userId: user.id,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      });

      return { user, profile: profile.data };
    });
  }

  async findUserForLogin(email: string): Promise<{
    user: PublicUserRecord;
    passwordHash: string;
    profile: Prisma.JsonValue | null;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        ...publicUserSelect,
        passwordHash: true,
        customerProfile: { select: { data: true } },
      },
    });

    if (!user) return null;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        locale: user.locale,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      passwordHash: user.passwordHash,
      profile: user.customerProfile?.data ?? null,
    };
  }

  async createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.session.create({ data: { userId, tokenHash, expiresAt } });
  }

  async findSessionByTokenHash(tokenHash: string): Promise<{
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null> {
    return this.prisma.session.findUnique({
      where: { tokenHash },
      select: { userId: true, expiresAt: true, revokedAt: true },
    });
  }

  async revokeSession(tokenHash: string, revokedAt: Date): Promise<void> {
    await this.prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt },
    });
  }

  async getUserProfile(userId: string): Promise<{
    user: PublicUserRecord;
    profile: Prisma.JsonValue;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ...publicUserSelect, customerProfile: { select: { data: true } } },
    });
    if (!user?.customerProfile) return null;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        locale: user.locale,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      profile: user.customerProfile.data,
    };
  }

  async findEmailAccount(email: string): Promise<{ id: string; locale: string } | null> {
    return this.prisma.user.findUnique({ where: { email }, select: { id: true, locale: true } });
  }

  async updateLocale(userId: string, locale: SupportedLocale): Promise<PublicUserRecord | null> {
    const user = await this.prisma.user.update({
      where: { id: userId }, data: { locale }, select: publicUserSelect,
    }).catch((error: unknown) => {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') return null;
      throw error;
    });
    return user;
  }

  async updateAccount(userId: string, input: UpdateAccountInput): Promise<{ user: PublicUserRecord; emailChanged: boolean } | null> {
    return this.prisma.$transaction(async (transaction) => {
      const previous = await transaction.user.findUnique({ where: { id: userId }, select: { email: true } });
      if (!previous) return null;
      const emailChanged = previous.email !== input.email;
      const user = await transaction.user.update({
        where: { id: userId },
        data: { name: input.name, email: input.email, ...(emailChanged ? { emailVerifiedAt: null } : {}) },
        select: publicUserSelect,
      });
      if (emailChanged) {
        await transaction.emailVerificationToken.updateMany({
          where: { userId, usedAt: null }, data: { usedAt: new Date() },
        });
      }
      return { user, emailChanged };
    });
  }

  async findUserPassword(userId: string): Promise<(PublicUserRecord & { passwordHash: string }) | null> {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { ...publicUserSelect, passwordHash: true } });
  }

  async rotatePasswordAndSession(input: {
    userId: string;
    previousPasswordHash: string;
    passwordHash: string;
    currentTokenHash: string;
    newTokenHash: string;
    expiresAt: Date;
    now: Date;
  }): Promise<PublicUserRecord | null> {
    return this.prisma.$transaction(async (transaction) => {
      const currentSession = await transaction.session.findUnique({
        where: { tokenHash: input.currentTokenHash },
        select: { userId: true, revokedAt: true, expiresAt: true },
      });
      if (!currentSession || currentSession.userId !== input.userId || currentSession.revokedAt || currentSession.expiresAt <= input.now) return null;
      const updated = await transaction.user.updateMany({
        where: { id: input.userId, passwordHash: input.previousPasswordHash },
        data: { passwordHash: input.passwordHash },
      });
      if (updated.count !== 1) return null;
      await transaction.session.updateMany({
        where: { userId: input.userId, revokedAt: null }, data: { revokedAt: input.now },
      });
      await transaction.session.create({
        data: { userId: input.userId, tokenHash: input.newTokenHash, expiresAt: input.expiresAt },
      });
      return transaction.user.findUniqueOrThrow({ where: { id: input.userId }, select: publicUserSelect });
    });
  }

  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } }),
      this.prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } }),
    ]);
  }

  async resetPassword(tokenHash: string, passwordHash: string, now: Date): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      const token = await transaction.passwordResetToken.findUnique({ where: { tokenHash }, select: { id: true, userId: true } });
      if (!token) return false;
      const consumed = await transaction.passwordResetToken.updateMany({
        where: { id: token.id, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now },
      });
      if (consumed.count !== 1) return false;
      await transaction.user.update({ where: { id: token.userId }, data: { passwordHash } });
      await transaction.session.updateMany({ where: { userId: token.userId, revokedAt: null }, data: { revokedAt: now } });
      return true;
    });
  }

  async createVerificationToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } }),
      this.prisma.emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } }),
    ]);
  }

  async verifyEmail(tokenHash: string, now: Date): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      const token = await transaction.emailVerificationToken.findUnique({ where: { tokenHash }, select: { id: true, userId: true } });
      if (!token) return false;
      const consumed = await transaction.emailVerificationToken.updateMany({
        where: { id: token.id, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now },
      });
      if (consumed.count !== 1) return false;
      await transaction.user.updateMany({ where: { id: token.userId, emailVerifiedAt: null }, data: { emailVerifiedAt: now } });
      return true;
    });
  }
}
