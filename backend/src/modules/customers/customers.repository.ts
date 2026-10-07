import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import type { UpdateCustomerProfileInput } from '@integra/shared/auth';
import type { CustomerProfileInput } from '@integra/shared/profile';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.customerProfile.findUnique({
      where: { userId }, select: { data: true, revision: true, updatedAt: true },
    });
  }

  async getAvatarObjectKey(userId: string): Promise<string | null> {
    const profile = await this.prisma.customerProfile.findUnique({ where: { userId }, select: { avatarObjectKey: true } });
    return profile?.avatarObjectKey ?? null;
  }

  async updateAvatarObjectKey(userId: string, avatarObjectKey: string | null): Promise<void> {
    await this.prisma.customerProfile.update({ where: { userId }, data: { avatarObjectKey } });
  }

  async updateProfile(userId: string, revision: number, profile: UpdateCustomerProfileInput['profile']) {
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.customerProfile.findUnique({
        where: { userId }, select: { data: true, revision: true },
      });
      if (!current || current.revision !== revision) return null;
      const savedProfile = current.data as CustomerProfileInput;
      const mergedProfile: CustomerProfileInput = {
        schemaVersion: savedProfile.schemaVersion,
        organization: profile.organization,
        representative: profile.representative,
        selectedSystems: savedProfile.selectedSystems,
      };
      const updated = await transaction.customerProfile.updateMany({
        where: { userId, revision },
        data: { data: mergedProfile as Prisma.InputJsonValue, revision: { increment: 1 } },
      });
      if (updated.count !== 1) return null;
      return transaction.customerProfile.findUnique({
        where: { userId }, select: { data: true, revision: true, updatedAt: true },
      });
    });
  }
}
