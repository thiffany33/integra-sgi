import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import { EMAIL_SERVICE } from '../src/modules/email/email.service';

describe('platform administrator HTTP flow', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminId: string;
  let customerId: string;
  let adminCookie: string;
  let customerCookie: string;
  const marker = randomUUID();
  const profile = {
    schemaVersion: 1,
    organization: { name: 'Alpha Company', nif: '123456789', sector: 'Services', email: 'contact@example.pt' },
    representative: { name: 'Person', email: '', phone: '' },
    selectedSystems: ['sgq'],
  };

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/integra_sgi';
    process.env.DIRECT_URL = process.env.DATABASE_URL;
    process.env.SESSION_SECRET = 'test-session-secret-with-at-least-thirty-two-characters';
    process.env.APP_URL = 'http://localhost:5173';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    const { AppModule } = await import('../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMAIL_SERVICE).useValue({ send: async () => undefined }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    const register = async (name: string, email: string) => request(app.getHttpServer())
      .post('/api/v1/auth/register').send({ name, email, password: 'correct-horse-battery', profile });
    const admin = await register('Administrator', `admin-${marker}@example.pt`);
    const customer = await register('Searchable Customer', `customer-${marker}@example.pt`);
    expect(admin.status).toBe(201);
    expect(customer.status).toBe(201);
    adminId = admin.body.user.id;
    customerId = customer.body.user.id;
    adminCookie = (admin.headers['set-cookie'] as string[])[0].split(';')[0];
    customerCookie = (customer.headers['set-cookie'] as string[])[0].split(';')[0];
    await prisma.user.update({ where: { id: adminId }, data: { role: 'PLATFORM_ADMIN' } });
  }, 30_000);

  afterAll(async () => {
    if (prisma && customerId) await prisma.customerSystemsChange.deleteMany({ where: { targetUserId: customerId } });
    if (prisma && adminId) await prisma.user.deleteMany({ where: { id: { in: [adminId, customerId] } } });
    if (app) await app.close();
  });

  it('rejects anonymous and customer requests before reading admin data', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/customers').expect(401);
    await request(app.getHttpServer()).get('/api/v1/admin/customers').set('Cookie', customerCookie)
      .expect(403).expect(({ body }) => expect(body.error.code).toBe('FORBIDDEN'));
    await request(app.getHttpServer()).patch(`/api/v1/admin/customers/${customerId}/systems`)
      .set('Cookie', customerCookie).send({ selectedSystems: ['sga'], revision: 1 }).expect(403);
  });

  it('searches customer names and emails, with empty and invalid-cursor results', async () => {
    const found = await request(app.getHttpServer()).get(`/api/v1/admin/customers?search=${encodeURIComponent(marker)}`)
      .set('Cookie', adminCookie).expect(200);
    expect(found.body.items).toHaveLength(1);
    expect(found.body.items[0]).toMatchObject({ userId: customerId, organizationName: 'Alpha Company', selectedSystems: ['sgq'], revision: 1 });
    expect(found.body.items[0]).not.toHaveProperty('passwordHash');
    const empty = await request(app.getHttpServer()).get('/api/v1/admin/customers?search=notfoundzzzz')
      .set('Cookie', adminCookie).expect(200);
    expect(empty.body).toEqual({ items: [], nextCursor: null });
    await request(app.getHttpServer()).get('/api/v1/admin/customers?cursor=invalid!')
      .set('Cookie', adminCookie).expect(400);
    await request(app.getHttpServer()).get('/api/v1/admin/customers?limit=51')
      .set('Cookie', adminCookie).expect(400);
  });

  it('returns the next customer page using an opaque cursor', async () => {
    const extra = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      name: 'Second customer', email: `second-${marker}@example.pt`, password: 'correct-horse-battery', profile,
    }).expect(201);
    const extraId = extra.body.user.id as string;
    try {
      const first = await request(app.getHttpServer()).get(`/api/v1/admin/customers?search=${marker}&limit=1`)
        .set('Cookie', adminCookie).expect(200);
      expect(first.body.items).toHaveLength(1);
      expect(first.body.nextCursor).toBe(first.body.items[0].userId);
      const second = await request(app.getHttpServer())
        .get(`/api/v1/admin/customers?search=${marker}&limit=1&cursor=${first.body.nextCursor}`)
        .set('Cookie', adminCookie).expect(200);
      expect(second.body.items).toHaveLength(1);
      expect(second.body.items[0].userId).not.toBe(first.body.items[0].userId);
      expect(second.body.nextCursor).toBeNull();
    } finally {
      await prisma.user.delete({ where: { id: extraId } });
    }
  });

  it('updates systems once and writes an audit in the same revision', async () => {
    const path = `/api/v1/admin/customers/${customerId}/systems`;
    await request(app.getHttpServer()).patch(path).set('Cookie', adminCookie)
      .send({ selectedSystems: ['sgq', 'sgq'], revision: 1 }).expect(400);
    const changed = await request(app.getHttpServer()).patch(path).set('Cookie', adminCookie)
      .send({ selectedSystems: ['sgq', 'sga'], revision: 1 }).expect(200);
    expect(changed.body).toMatchObject({ userId: customerId, selectedSystems: ['sgq', 'sga'], revision: 2 });
    const audit = await prisma.customerSystemsChange.findMany({ where: { targetUserId: customerId } });
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ actorUserId: adminId, previousSystems: ['sgq'], newSystems: ['sgq', 'sga'] });
    await request(app.getHttpServer()).patch(path).set('Cookie', adminCookie)
      .send({ selectedSystems: ['sgsst'], revision: 1 }).expect(409)
      .expect(({ body }) => expect(body.error.code).toBe('PROFILE_REVISION_CONFLICT'));
    await request(app.getHttpServer()).patch(`/api/v1/admin/customers/${adminId}/systems`).set('Cookie', adminCookie)
      .send({ selectedSystems: ['sgsst'], revision: 1 }).expect(404);
    await request(app.getHttpServer()).patch('/api/v1/admin/customers/missing/systems').set('Cookie', adminCookie)
      .send({ selectedSystems: ['sgsst'], revision: 1 }).expect(404);
  });
});
