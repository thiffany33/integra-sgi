import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class RequirementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCustomerProfile(userId: string) {
    return this.prisma.customerProfile.findUnique({ where: { userId }, select: { data: true } });
  }
}
