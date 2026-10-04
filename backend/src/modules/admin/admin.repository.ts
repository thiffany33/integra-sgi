import { Injectable } from '@nestjs/common';
import type { CustomerProfileInput, SelectedSystem } from '@integra/shared/profile';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

export type CustomerSummary = {
  userId: string;
  name: string;
  email: string;
  organizationName: string;
  selectedSystems: SelectedSystem[];
  revision: number;
  updatedAt: Date;
};

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  customerProfile: { data: Prisma.JsonValue; revision: number; updatedAt: Date } | null;
};

function summary(row: CustomerRow): CustomerSummary {
  const profile = row.customerProfile!;
  const data = profile.data as CustomerProfileInput;
  return {
    userId: row.id,
    name: row.name,
    email: row.email,
    organizationName: data.organization.name,
    selectedSystems: data.selectedSystems,
    revision: profile.revision,
    updatedAt: profile.updatedAt,
  };
}

const customerSelect = {
  id: true,
  name: true,
  email: true,
  customerProfile: { select: { data: true, revision: true, updatedAt: true } },
} as const;

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listCustomers(input: { search?: string; cursor?: string; limit: number }): Promise<{ items: CustomerSummary[]; nextCursor: string | null } | 'INVALID_CURSOR'> {
    if (input.cursor) {
      const exists = await this.prisma.user.findFirst({
        where: { id: input.cursor, role: 'CUSTOMER', customerProfile: { isNot: null } }, select: { id: true },
      });
      if (!exists) return 'INVALID_CURSOR';
    }
    const search = input.search?.trim();
    const rows = await this.prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        customerProfile: { isNot: null },
        ...(input.cursor ? { id: { gt: input.cursor } } : {}),
        ...(search ? { OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ] } : {}),
      },
      select: customerSelect,
      orderBy: { id: 'asc' },
      take: input.limit + 1,
    });
    const page = rows.slice(0, input.limit);
    return { items: page.map(summary), nextCursor: rows.length > input.limit ? page.at(-1)!.id : null };
  }

  async updateCustomerSystems(
    actorUserId: string,
    targetUserId: string,
    selectedSystems: SelectedSystem[],
    revision: number,
  ): Promise<CustomerSummary | 'NOT_FOUND' | 'CONFLICT'> {
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { id: targetUserId },
        select: { ...customerSelect, role: true },
      });
      if (!user || user.role !== 'CUSTOMER' || !user.customerProfile) return 'NOT_FOUND';
      if (user.customerProfile.revision !== revision) return 'CONFLICT';

      const existing = user.customerProfile.data as CustomerProfileInput;
      const updated = await transaction.customerProfile.updateMany({
        where: { userId: targetUserId, revision },
        data: {
          data: { ...existing, selectedSystems } as Prisma.InputJsonValue,
          revision: { increment: 1 },
        },
      });
      if (updated.count !== 1) return 'CONFLICT';
      await transaction.customerSystemsChange.create({
        data: {
          actorUserId,
          targetUserId,
          previousSystems: existing.selectedSystems as Prisma.InputJsonValue,
          newSystems: selectedSystems as Prisma.InputJsonValue,
        },
      });
      const profile = await transaction.customerProfile.findUniqueOrThrow({
        where: { userId: targetUserId }, select: { data: true, revision: true, updatedAt: true },
      });
      return summary({ id: user.id, name: user.name, email: user.email, customerProfile: profile });
    });
  }
}
