import { HttpStatus, Injectable } from '@nestjs/common';
import {
  getOrganizationDiscoverySaveSchema,
  organizationDiscoveryRequirementCodeByStep,
  organizationDiscoveryResponseSchemas,
  type OrganizationDiscoveryResponses,
  type OrganizationDiscoveryState,
  type OrganizationDiscoverySaveStep,
  type OrganizationDiscoveryRequirementCode,
} from '@integra/shared/requirements';
import { ApiException } from '../../utils/api-exception';
import { GuidedFlowsRepository, ORGANIZATION_DISCOVERY_FLOW_KEY } from './guided-flows.repository';

const requirementCodes = Object.keys(organizationDiscoveryResponseSchemas) as OrganizationDiscoveryRequirementCode[];

@Injectable()
export class GuidedFlowsService {
  constructor(private readonly repository: GuidedFlowsRepository) {}

  async getOrganizationDiscovery(userId: string): Promise<OrganizationDiscoveryState> {
    const [flow, records] = await Promise.all([
      this.repository.findFlow(userId, ORGANIZATION_DISCOVERY_FLOW_KEY),
      this.repository.findResponses(userId, requirementCodes),
    ]);
    const responses: OrganizationDiscoveryResponses = {};
    for (const record of records) {
      const code = record.requirementCode as OrganizationDiscoveryRequirementCode;
      const parsed = organizationDiscoveryResponseSchemas[code]?.safeParse(record.data);
      if (parsed?.success) Object.assign(responses, { [code]: parsed.data });
    }
    if (!flow) return { status: 'NOT_STARTED', currentStep: 1, completedSteps: [], revision: 0, responses };
    return {
      status: flow.status,
      currentStep: flow.currentStep as OrganizationDiscoveryState['currentStep'],
      completedSteps: flow.completedSteps as OrganizationDiscoveryState['completedSteps'],
      revision: flow.revision,
      responses,
    };
  }

  async saveOrganizationDiscoveryStep(userId: string, step: number, input: unknown): Promise<OrganizationDiscoveryState> {
    const schema = getOrganizationDiscoverySaveSchema(step);
    const parsed = schema?.safeParse(input);
    if (!parsed?.success) throw new ApiException(HttpStatus.BAD_REQUEST, {
      code: 'GUIDED_FLOW_INVALID_INPUT', message: 'The discovery answers are invalid.',
    });
    const code = organizationDiscoveryRequirementCodeByStep[step as OrganizationDiscoverySaveStep];
    await this.repository.saveStep({
      userId, flowKey: ORGANIZATION_DISCOVERY_FLOW_KEY, step,
      expectedRevision: parsed.data.revision,
      responsesByCode: { [code]: parsed.data.answers },
    });
    return this.getOrganizationDiscovery(userId);
  }

  async completeOrganizationDiscovery(userId: string, expectedRevision: number): Promise<OrganizationDiscoveryState> {
    if (!Number.isInteger(expectedRevision) || expectedRevision < 0) throw new ApiException(HttpStatus.BAD_REQUEST, {
      code: 'GUIDED_FLOW_INVALID_INPUT', message: 'The discovery revision is invalid.',
    });
    await this.repository.completeFlow(userId, ORGANIZATION_DISCOVERY_FLOW_KEY, expectedRevision);
    return this.getOrganizationDiscovery(userId);
  }
}
