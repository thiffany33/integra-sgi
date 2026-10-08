/* eslint-disable @typescript-eslint/no-explicit-any -- Prisma test double uses minimal query shapes. */

import { describe, expect, it } from 'vitest';
import { GuidedFlowsRepository } from '../src/modules/guided-flows/guided-flows.repository';
import { GuidedFlowsService } from '../src/modules/guided-flows/guided-flows.service';
import type { PrismaService } from '../src/infra/prisma/prisma.service';

type Flow = { userId: string; flowKey: string; currentStep: number; completedSteps: number[]; status: 'IN_PROGRESS' | 'COMPLETED'; revision: number };
type Response = { userId: string; requirementCode: string; data: Record<string, unknown>; revision: number; schemaVersion: number };

function fixture() {
  let flows: Flow[] = [];
  let responses: Response[] = [];
  let failResponseCode: string | undefined;
  const api = {
    customerGuidedFlow: {
      findUnique: async ({ where }: any) => flows.find((x) => x.userId === where.userId_flowKey.userId && x.flowKey === where.userId_flowKey.flowKey) ?? null,
      create: async ({ data }: any) => {
        if (flows.some((x) => x.userId === data.userId && x.flowKey === data.flowKey)) throw new Error('duplicate');
        const value = structuredClone(data) as Flow;
        flows.push(value);
        return value;
      },
      updateMany: async ({ where, data }: any) => {
        const value = flows.find((x) => x.userId === where.userId && x.flowKey === where.flowKey && x.revision === where.revision);
        if (!value) return { count: 0 };
        Object.assign(value, data, { revision: value.revision + data.revision.increment });
        return { count: 1 };
      },
    },
    customerRequirementResponse: {
      findMany: async ({ where }: any) => responses.filter((x) => x.userId === where.userId && where.requirementCode.in.includes(x.requirementCode)),
      findUnique: async ({ where }: any) => responses.find((x) => x.userId === where.userId_requirementCode.userId && x.requirementCode === where.userId_requirementCode.requirementCode) ?? null,
      upsert: async ({ where, create, update }: any) => {
        if (failResponseCode === where.userId_requirementCode.requirementCode) throw new Error('storage failure');
        const old = responses.find((x) => x.userId === where.userId_requirementCode.userId && x.requirementCode === where.userId_requirementCode.requirementCode);
        if (old) { old.data = structuredClone(update.data); old.revision++; return old; }
        const value = { ...structuredClone(create), revision: 1 } as Response;
        responses.push(value);
        return value;
      },
    },
  };
  const prisma = { ...api, $transaction: async <T>(callback: (tx: typeof api) => Promise<T>) => {
    const previousFlows = structuredClone(flows);
    const previousResponses = structuredClone(responses);
    try { return await callback(api); } catch (error) { flows = previousFlows; responses = previousResponses; throw error; }
  } } as unknown as PrismaService;
  const repository = new GuidedFlowsRepository(prisma);
  return { repository, service: new GuidedFlowsService(repository), get flows() { return flows; }, get responses() { return responses; }, failResponse(code: string) { failResponseCode = code; } };
}

const save = (revision: number, answers: Record<string, unknown>) => ({ revision, answers });

describe('GuidedFlowsService', () => {
  it('returns an empty not-started state', async () => {
    const db = fixture();
    expect(await db.service.getOrganizationDiscovery('ana')).toEqual({ status: 'NOT_STARTED', currentStep: 1, completedSteps: [], revision: 0, responses: {} });
  });

  it('isolates each user’s saved responses', async () => {
    const db = fixture();
    await db.service.saveOrganizationDiscoveryStep('ana', 1, save(0, { workforceRange: '1-9' }));
    expect((await db.service.getOrganizationDiscovery('bia')).responses).toEqual({});
    expect((await db.service.getOrganizationDiscovery('ana')).responses).toEqual({ '4.1': { workforceRange: '1-9' } });
  });

  it('merges partial answers for steps sharing requirement 4.1', async () => {
    const db = fixture();
    await db.service.saveOrganizationDiscoveryStep('ana', 1, save(0, { workforceRange: '1-9' }));
    await db.service.saveOrganizationDiscoveryStep('ana', 2, save(1, { customerTypes: ['businesses'] }));
    await db.service.saveOrganizationDiscoveryStep('ana', 1, save(2, { workLocation: 'remote' }));
    expect((await db.service.getOrganizationDiscovery('ana')).responses['4.1']).toEqual({ workforceRange: '1-9', customerTypes: ['businesses'], workLocation: 'remote' });
    expect(db.responses).toHaveLength(1);
  });

  it('advances to the first unsaved step and preserves completed steps', async () => {
    const db = fixture();
    expect(await db.service.saveOrganizationDiscoveryStep('ana', 3, save(0, { additionalPeople: [] }))).toMatchObject({ currentStep: 1, completedSteps: [3], revision: 1 });
    expect(await db.service.saveOrganizationDiscoveryStep('ana', 1, save(1, { workforceRange: '1-9' }))).toMatchObject({ currentStep: 2, completedSteps: [1, 3], revision: 2 });
  });

  it('rejects stale writes without changing stored answers', async () => {
    const db = fixture();
    await db.service.saveOrganizationDiscoveryStep('ana', 1, save(0, { workforceRange: '1-9' }));
    await expect(db.service.saveOrganizationDiscoveryStep('ana', 1, save(0, { workforceRange: '250+' }))).rejects.toMatchObject({ response: { error: { code: 'GUIDED_FLOW_REVISION_CONFLICT' } } });
    expect((await db.service.getOrganizationDiscovery('ana')).responses['4.1']).toEqual({ workforceRange: '1-9' });
  });

  it('rolls back the flow update when response storage fails', async () => {
    const db = fixture();
    db.failResponse('4.1');
    await expect(db.service.saveOrganizationDiscoveryStep('ana', 1, save(0, { workforceRange: '1-9' }))).rejects.toThrow('storage failure');
    expect(await db.service.getOrganizationDiscovery('ana')).toMatchObject({ status: 'NOT_STARTED', revision: 0, responses: {} });
  });

  it('rejects an invalid merged requirement response before writing', async () => {
    const db = fixture();
    await expect(db.repository.saveStep({
      userId: 'ana', flowKey: 'organization-discovery', step: 1, expectedRevision: 0,
      responsesByCode: { '4.1': { workforceRange: '1-9' }, '4.2': { additionalPeople: [{ name: '', role: 'quality' }] } },
    })).rejects.toMatchObject({ response: { error: { code: 'GUIDED_FLOW_INVALID_INPUT' } } });
    expect(db.flows).toHaveLength(0);
    expect(db.responses).toHaveLength(0);
  });

  it('rejects invalid step payloads before writing flow or responses', async () => {
    const db = fixture();
    await expect(db.service.saveOrganizationDiscoveryStep('ana', 1, save(0, { workforceRange: 'wrong' }))).rejects.toMatchObject({ response: { error: { code: 'GUIDED_FLOW_INVALID_INPUT' } } });
    expect(db.flows).toHaveLength(0);
    expect(db.responses).toHaveLength(0);
  });

  it('requires all five saved steps before completion', async () => {
    const db = fixture();
    await db.service.saveOrganizationDiscoveryStep('ana', 1, save(0, {}));
    await expect(db.service.completeOrganizationDiscovery('ana', 1)).rejects.toMatchObject({ status: 400, response: { error: { code: 'INCOMPLETE_GUIDED_FLOW' } } });
    expect(db.flows[0].status).toBe('IN_PROGRESS');
  });

  it('completes discovery without adding ISO compliance fields', async () => {
    const db = fixture();
    for (let step = 1; step <= 5; step++) await db.service.saveOrganizationDiscoveryStep('ana', step, save(step - 1, {}));
    const state = await db.service.completeOrganizationDiscovery('ana', 5);
    expect(state).toMatchObject({ status: 'COMPLETED', currentStep: 6, completedSteps: [1, 2, 3, 4, 5, 6], revision: 6 });
    expect(db.responses.map((x) => x.data)).toEqual([{}, {}, {}, {}]);
    expect(JSON.stringify({ state, responses: db.responses })).not.toMatch(/compliant|compliance|conform/i);
  });
});
