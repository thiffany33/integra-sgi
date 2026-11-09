import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import { EMAIL_SERVICE } from '../src/modules/email/email.service';

const SECRET = 'retention-job-secret-with-at-least-thirty-two-chars';
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

describe('retention purge', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;
  const marker = randomUUID();

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/integra_sgi';
    process.env.DIRECT_URL = process.env.DATABASE_URL;
    process.env.SESSION_SECRET = 'test-session-secret-with-at-least-thirty-two-characters';
    process.env.APP_URL = 'http://localhost:5173';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.RETENTION_JOB_SECRET = SECRET;
    const { AppModule } = await import('../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMAIL_SERVICE).useValue({ send: async () => undefined }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    const user = await prisma.user.create({ data: { name: 'Retention', email: `retention-${marker}@example.pt`, passwordHash: 'x' } });
    userId = user.id;
  }, 30_000);

  afterAll(async () => {
    delete process.env.RETENTION_JOB_SECRET;
    if (prisma && userId) await prisma.user.deleteMany({ where: { id: userId } });
    if (app) await app.close();
  });

  it('rejects calls without the job secret', async () => {
    await request(app.getHttpServer()).post('/api/v1/internal/retention/purge').expect(401);
    await request(app.getHttpServer()).post('/api/v1/internal/retention/purge')
      .set('Authorization', 'Bearer wrong-secret').expect(401);
  });

  it('deletes expired, revoked, used and out-of-retention records and keeps the rest', async () => {
    const now = Date.now();
    const hash = () => randomUUID().replaceAll('-', '').padEnd(64, '0');
    const live = await prisma.session.create({ data: { userId, tokenHash: hash(), expiresAt: new Date(now + DAY_MS) } });
    const expired = await prisma.session.create({ data: { userId, tokenHash: hash(), expiresAt: new Date(now - 1000) } });
    const revoked = await prisma.session.create({ data: { userId, tokenHash: hash(), expiresAt: new Date(now + DAY_MS), revokedAt: new Date() } });
    const usedReset = await prisma.passwordResetToken.create({ data: { userId, tokenHash: hash(), expiresAt: new Date(now + HOUR_MS), usedAt: new Date() } });
    const pendingReset = await prisma.passwordResetToken.create({ data: { userId, tokenHash: hash(), expiresAt: new Date(now + HOUR_MS) } });
    const expiredVerification = await prisma.emailVerificationToken.create({ data: { userId, tokenHash: hash(), expiresAt: new Date(now - 1000) } });
    const expiredBucket = hash();
    const liveBucket = hash();
    await prisma.authRateLimitBucket.createMany({ data: [
      { key: expiredBucket, windowStartedAt: new Date(now - 2 * HOUR_MS), expiresAt: new Date(now - HOUR_MS) },
      { key: liveBucket, windowStartedAt: new Date(now), expiresAt: new Date(now + HOUR_MS) },
    ] });
    const oldEvent = await prisma.auditEvent.create({ data: { userId, action: 'test.old', createdAt: new Date(now - 366 * DAY_MS) } });
    const recentEvent = await prisma.auditEvent.create({ data: { userId, action: 'test.recent', createdAt: new Date(now - 300 * DAY_MS) } });

    const response = await request(app.getHttpServer()).post('/api/v1/internal/retention/purge')
      .set('Authorization', `Bearer ${SECRET}`).expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.data ?? response.body).toMatchObject({ sessions: expect.any(Number) });

    const sessions = await prisma.session.findMany({ where: { id: { in: [live.id, expired.id, revoked.id] } }, select: { id: true } });
    expect(sessions.map(session => session.id)).toEqual([live.id]);
    const resets = await prisma.passwordResetToken.findMany({ where: { id: { in: [usedReset.id, pendingReset.id] } }, select: { id: true } });
    expect(resets.map(token => token.id)).toEqual([pendingReset.id]);
    expect(await prisma.emailVerificationToken.count({ where: { id: expiredVerification.id } })).toBe(0);
    // Other suites clear this table in parallel, so only the expired bucket is checked.
    expect(await prisma.authRateLimitBucket.count({ where: { key: expiredBucket } })).toBe(0);
    const events = await prisma.auditEvent.findMany({ where: { id: { in: [oldEvent.id, recentEvent.id] } }, select: { id: true } });
    expect(events.map(event => event.id)).toEqual([recentEvent.id]);
    await prisma.authRateLimitBucket.deleteMany({ where: { key: liveBucket } });
  });
});
