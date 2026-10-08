/* eslint-disable @typescript-eslint/no-explicit-any -- In-memory Prisma double models the transaction boundary. */
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { configureApp } from '../src/configure-app';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/infra/prisma/prisma.service';

type Flow = { userId: string; flowKey: string; currentStep: number; completedSteps: number[]; status: 'IN_PROGRESS' | 'COMPLETED'; revision: number };
type Answer = { userId: string; requirementCode: string; data: Record<string, unknown>; revision: number; schemaVersion: number };

describe('organization discovery HTTP API', () => {
  let app: INestApplication;
  let flows: Flow[] = [];
  let answers: Answer[] = [];
  const tables = {
    customerGuidedFlow: {
      findUnique: async ({ where }: any) => flows.find((item) => item.userId === where.userId_flowKey.userId && item.flowKey === where.userId_flowKey.flowKey) ?? null,
      create: async ({ data }: any) => { const item = structuredClone(data) as Flow; flows.push(item); return item; },
      updateMany: async ({ where, data }: any) => {
        const item = flows.find((value) => value.userId === where.userId && value.flowKey === where.flowKey && value.revision === where.revision);
        if (!item) return { count: 0 };
        Object.assign(item, data, { revision: item.revision + data.revision.increment });
        return { count: 1 };
      },
    },
    customerRequirementResponse: {
      findMany: async ({ where }: any) => answers.filter((item) => item.userId === where.userId && where.requirementCode.in.includes(item.requirementCode)),
      findUnique: async ({ where }: any) => answers.find((item) => item.userId === where.userId_requirementCode.userId && item.requirementCode === where.userId_requirementCode.requirementCode) ?? null,
      upsert: async ({ where, create, update }: any) => {
        const item = answers.find((value) => value.userId === where.userId_requirementCode.userId && value.requirementCode === where.userId_requirementCode.requirementCode);
        if (item) { item.data = structuredClone(update.data); item.revision++; return item; }
        const created = { ...structuredClone(create), revision: 1 } as Answer;
        answers.push(created);
        return created;
      },
    },
  };

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/integra_sgi';
    process.env.DIRECT_URL = process.env.DATABASE_URL;
    process.env.SESSION_SECRET = 'test-session-secret-with-at-least-thirty-two-characters';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.APP_URL = 'http://localhost:5173';
    const { AppModule } = await import('../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AuthService).useValue({ validateSession: async (token: string) => token === 'valid' ? { userId: 'ana', role: 'CUSTOMER' } : null })
      .overrideProvider(PrismaService).useValue({ ...tables, $transaction: async <T>(callback: (tx: typeof tables) => Promise<T>) => {
        const previousFlows = structuredClone(flows);
        const previousAnswers = structuredClone(answers);
        try { return await callback(tables); } catch (error) { flows = previousFlows; answers = previousAnswers; throw error; }
      } })
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => app?.close());
  beforeEach(() => { flows = []; answers = []; });

  const base = '/api/v1/guided-flows/organization-discovery';
  const auth = { Cookie: 'integra_session=valid' };

  it('returns a not-started state for a new authenticated user', async () => {
    const response = await request(app.getHttpServer()).get(base).set(auth).expect(200);
    expect(response.body).toEqual({ status: 'NOT_STARTED', currentStep: 1, completedSteps: [], revision: 0, responses: {} });
  });

  it('loads saved responses for the authenticated user', async () => {
    flows.push({ userId: 'ana', flowKey: 'organization-discovery', status: 'IN_PROGRESS', currentStep: 2, completedSteps: [1], revision: 1 });
    answers.push({ userId: 'ana', requirementCode: '4.1', data: { workforceRange: '1-9' }, revision: 1, schemaVersion: 1 });
    answers.push({ userId: 'other', requirementCode: '4.1', data: { workforceRange: '250+' }, revision: 1, schemaVersion: 1 });
    const response = await request(app.getHttpServer()).get(base).set(auth).expect(200);
    expect(response.body).toEqual({ status: 'IN_PROGRESS', currentStep: 2, completedSteps: [1], revision: 1, responses: { '4.1': { workforceRange: '1-9' } } });
  });

  it('saves a valid step and returns the revised state', async () => {
    const response = await request(app.getHttpServer()).put(`${base}/steps/1`).set(auth)
      .send({ revision: 0, answers: { workforceRange: '1-9' } }).expect(200);
    expect(response.body).toEqual({ status: 'IN_PROGRESS', currentStep: 2, completedSteps: [1], revision: 1, responses: { '4.1': { workforceRange: '1-9' } } });
  });

  it('rejects invalid step answers without saving them', async () => {
    const response = await request(app.getHttpServer()).put(`${base}/steps/1`).set(auth)
      .send({ revision: 0, answers: { workforceRange: 'invalid' } }).expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(flows).toHaveLength(0);
    expect(answers).toHaveLength(0);
  });

  it('rejects unsupported step numbers', async () => {
    await request(app.getHttpServer()).put(`${base}/steps/6`).set(auth)
      .send({ revision: 0, answers: {} }).expect(400);
    expect(flows).toHaveLength(0);
  });

  it('requires a session on every route', async () => {
    await request(app.getHttpServer()).get(base).expect(401);
    await request(app.getHttpServer()).put(`${base}/steps/1`).send({ revision: 0, answers: {} }).expect(401);
    await request(app.getHttpServer()).post(`${base}/complete`).send({ revision: 0 }).expect(401);
  });

  it('rejects a stale revision without replacing answers', async () => {
    await request(app.getHttpServer()).put(`${base}/steps/1`).set(auth).send({ revision: 0, answers: { workforceRange: '1-9' } }).expect(200);
    const response = await request(app.getHttpServer()).put(`${base}/steps/1`).set(auth).send({ revision: 0, answers: { workforceRange: '250+' } }).expect(409);
    expect(response.body.error.code).toBe('GUIDED_FLOW_REVISION_CONFLICT');
    expect(answers[0].data).toEqual({ workforceRange: '1-9' });
  });

  it('completes after all five steps are saved', async () => {
    for (let step = 1; step <= 5; step++) {
      await request(app.getHttpServer()).put(`${base}/steps/${step}`).set(auth).send({ revision: step - 1, answers: {} }).expect(200);
    }
    const response = await request(app.getHttpServer()).post(`${base}/complete`).set(auth).send({ revision: 5 }).expect(200);
    expect(response.body).toMatchObject({ status: 'COMPLETED', currentStep: 6, completedSteps: [1, 2, 3, 4, 5, 6], revision: 6 });
    expect(JSON.stringify(response.body)).not.toMatch(/compliant|compliance|conform/i);
  });

  it('returns 400 INCOMPLETE_GUIDED_FLOW until steps 1–5 are saved', async () => {
    await request(app.getHttpServer()).put(`${base}/steps/1`).set(auth).send({ revision: 0, answers: {} }).expect(200);
    const response = await request(app.getHttpServer()).post(`${base}/complete`).set(auth).send({ revision: 1 }).expect(400);
    expect(response.body.error.code).toBe('INCOMPLETE_GUIDED_FLOW');
    expect(flows[0].status).toBe('IN_PROGRESS');
  });
});
