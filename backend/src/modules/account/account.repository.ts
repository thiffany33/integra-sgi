import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Everything stored about the account holder, excluding secrets and other people's identities. */
  findExport(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, locale: true, emailVerifiedAt: true, createdAt: true, updatedAt: true, isAdmin: true,
        customerProfile: { select: { data: true, avatarObjectKey: true, createdAt: true, updatedAt: true } },
        requirementResponses: { select: { requirementCode: true, data: true, createdAt: true, updatedAt: true }, orderBy: { requirementCode: 'asc' } },
        guidedFlows: { select: { flowKey: true, status: true, currentStep: true, completedSteps: true, createdAt: true, updatedAt: true } },
        // The administrator who made each change is another person, so only what changed is exported.
        systemChangesReceived: { select: { previousSystems: true, newSystems: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  findForDeletion(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, isAdmin: true, customerProfile: { select: { avatarObjectKey: true } } },
    });
  }

  /** Sessions, tokens, profile, answers and progress cascade with the user; the systems history does not. */
  async deleteUser(userId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.customerSystemsChange.deleteMany({ where: { targetUserId: userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }
}
