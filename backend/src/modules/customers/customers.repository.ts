import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import type { CustomerProfileInput } from '@integra/shared/profile';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.customerProfile.findUnique({
      where: { userId }, select: { data: true, revision: true, updatedAt: true },
    });
  }

  async updateProfile(userId: string, revision: number, profile: CustomerProfileInput) {
    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.customerProfile.updateMany({
        where: { userId, revision },
        data: { data: profile as Prisma.InputJsonValue, revision: { increment: 1 } },
      });
      if (updated.count !== 1) return null;
      return transaction.customerProfile.findUnique({
        where: { userId }, select: { data: true, revision: true, updatedAt: true },
      });
    });
  }
}
