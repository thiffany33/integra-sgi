import { HttpStatus, Injectable } from '@nestjs/common';
import {
  organizationDiscoveryResponseSchemas,
  type OrganizationDiscoveryRequirementCode,
} from '@integra/shared/requirements';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { ApiException } from '../../utils/api-exception';

export const ORGANIZATION_DISCOVERY_FLOW_KEY = 'organization-discovery';
const conflict = () => new ApiException(HttpStatus.CONFLICT, {
  code: 'GUIDED_FLOW_REVISION_CONFLICT',
  message: 'This discovery changed elsewhere. Reload it and try again.',
});
const invalidInput = () => new ApiException(HttpStatus.BAD_REQUEST, {
  code: 'GUIDED_FLOW_INVALID_INPUT', message: 'The discovery answers are invalid.',
});

export type SaveStepOptions = {
  userId: string;
  flowKey: string;
  step: number;
  expectedRevision: number;
  responsesByCode: Partial<Record<OrganizationDiscoveryRequirementCode, Record<string, unknown>>>;
};

@Injectable()
export class GuidedFlowsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findFlow(userId: string, flowKey: string) {
    return this.prisma.customerGuidedFlow.findUnique({ where: { userId_flowKey: { userId, flowKey } } });
  }

  findResponses(userId: string, requirementCodes: readonly OrganizationDiscoveryRequirementCode[]) {
    return this.prisma.customerRequirementResponse.findMany({
      where: { userId, requirementCode: { in: [...requirementCodes] } },
    });
  }

  async saveStep({ userId, flowKey, step, expectedRevision, responsesByCode }: SaveStepOptions) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const current = await transaction.customerGuidedFlow.findUnique({ where: { userId_flowKey: { userId, flowKey } } });
        if ((current?.revision ?? 0) !== expectedRevision || current?.status === 'COMPLETED') throw conflict();

        const mergedResponses: Array<{ code: OrganizationDiscoveryRequirementCode; data: Prisma.InputJsonValue }> = [];
        for (const [code, patch] of Object.entries(responsesByCode) as Array<[OrganizationDiscoveryRequirementCode, Record<string, unknown>]>) {
          const stored = await transaction.customerRequirementResponse.findUnique({
            where: { userId_requirementCode: { userId, requirementCode: code } },
          });
          const merged = { ...(stored?.data as Record<string, unknown> | undefined), ...patch };
          const parsed = organizationDiscoveryResponseSchemas[code]?.safeParse(merged);
          if (!parsed?.success) throw invalidInput();
          mergedResponses.push({ code, data: parsed.data as Prisma.InputJsonValue });
        }

        const completedSteps = [...new Set([...(current?.completedSteps ?? []), step])].sort((a, b) => a - b);
        const currentStep = [1, 2, 3, 4, 5].find((candidate) => !completedSteps.includes(candidate)) ?? 6;
        if (current) {
          const updated = await transaction.customerGuidedFlow.updateMany({
            where: { userId, flowKey, revision: expectedRevision },
            data: { completedSteps, currentStep, revision: { increment: 1 } },
          });
          if (updated.count !== 1) throw conflict();
        } else {
          await transaction.customerGuidedFlow.create({
            data: { userId, flowKey, completedSteps, currentStep, status: 'IN_PROGRESS', revision: 1 },
          });
        }
        for (const response of mergedResponses) {
          await transaction.customerRequirementResponse.upsert({
            where: { userId_requirementCode: { userId, requirementCode: response.code } },
            create: { userId, requirementCode: response.code, schemaVersion: 1, data: response.data },
            update: { data: response.data, schemaVersion: 1, revision: { increment: 1 } },
          });
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw conflict();
      throw error;
    }
  }

  async completeFlow(userId: string, flowKey: string, expectedRevision: number) {
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.customerGuidedFlow.findUnique({ where: { userId_flowKey: { userId, flowKey } } });
      if ((current?.revision ?? 0) !== expectedRevision || current?.status === 'COMPLETED') throw conflict();
      if (!current || ![1, 2, 3, 4, 5].every((step) => current.completedSteps.includes(step))) {
        throw new ApiException(HttpStatus.BAD_REQUEST, {
          code: 'INCOMPLETE_GUIDED_FLOW', message: 'Save every discovery step before completing it.',
        });
      }
      const updated = await transaction.customerGuidedFlow.updateMany({
        where: { userId, flowKey, revision: expectedRevision },
        data: { status: 'COMPLETED', currentStep: 6, completedSteps: [1, 2, 3, 4, 5, 6], revision: { increment: 1 } },
      });
      if (updated.count !== 1) throw conflict();
    });
  }
}
