import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import { EMAIL_SERVICE } from '../src/modules/email/email.service';
import { ObjectStorageService } from '../src/modules/storage/object-storage.service';

// Always the local database: backend/.env may point elsewhere.
const LOCAL_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/integra_sgi';

describe('account export and deletion', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const marker = randomUUID();
  const password = 'correct-horse-battery';
  const deleteObject = vi.fn();
  const profile = {
    schemaVersion: 1,
    organization: { name: 'Delete Me Lda', nif: '123456789', sector: 'Serviços', email: 'contact@example.pt' },
    representative: { name: 'Person', email: '', phone: '' },
    selectedSystems: ['sgq'],
  };

  async function account(prefix: string) {
    const email = `${prefix}-${marker}@example.pt`;
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({ name: 'Delete Me', email, password, profile }).expect(201);
    const user = await prisma.user.update({ where: { email }, data: { emailVerifiedAt: new Date() } });
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password }).expect(200);
    return { id: user.id, email, cookie: (login.headers['set-cookie'] as string[])[0].split(';')[0] };
  }

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = LOCAL_DATABASE_URL;
    process.env.DIRECT_URL = LOCAL_DATABASE_URL;
    process.env.SESSION_SECRET = 'test-session-secret-with-at-least-thirty-two-characters';
    process.env.APP_URL = 'http://localhost:5173';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    const { AppModule } = await import('../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMAIL_SERVICE).useValue({ send: async () => undefined })
      .overrideProvider(ObjectStorageService).useValue({ deleteObject })
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  }, 30_000);

  beforeEach(async () => {
    deleteObject.mockReset().mockResolvedValue(undefined);
    await prisma.$executeRawUnsafe('DELETE FROM "AuthRateLimitBucket"');
  });

  afterAll(async () => {
    if (prisma) await prisma.user.deleteMany({ where: { email: { endsWith: `-${marker}@example.pt` } } });
    if (app) await app.close();
  });

  it('exports the signed-in account as a download, without secrets', async () => {
    await request(app.getHttpServer()).get('/api/v1/account/export').expect(401);
    const { cookie, email } = await account('export');
    const response = await request(app.getHttpServer()).get('/api/v1/account/export').set('Cookie', cookie).expect(200);
    expect(response.headers['content-disposition']).toContain('attachment');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toMatchObject({
      schemaVersion: 1,
      account: { email, name: 'Delete Me' },
      profile: { organization: { name: 'Delete Me Lda' }, hasProfilePhoto: false },
      requirementResponses: [], guidedFlows: [], selectedSystemsHistory: [],
    });
    expect(JSON.stringify(response.body)).not.toMatch(/passwordHash|tokenHash|argon2/);
    expect(await prisma.auditEvent.count({ where: { action: 'account.exported', user: { email } } })).toBe(1);
  });

  it('keeps the account when the password is wrong', async () => {
    const { id, cookie } = await account('wrong');
    await request(app.getHttpServer()).post('/api/v1/account/delete').set('Cookie', cookie)
      .send({ password: 'not-the-password' }).expect(401)
      .expect(({ body }) => expect(body.error.code).toBe('INVALID_CURRENT_PASSWORD'));
    expect(await prisma.user.count({ where: { id } })).toBe(1);
  });

  it('deletes the account, its photo, answers and sessions, and signs out', async () => {
    const { id, cookie } = await account('delete');
    await prisma.customerProfile.update({ where: { userId: id }, data: { avatarObjectKey: `avatars/${id}/photo.png` } });
    await prisma.customerRequirementResponse.create({ data: { userId: id, requirementCode: '4.1', data: { workforceRange: '1-9' } } });
    await prisma.customerSystemsChange.create({ data: { actorUserId: id, targetUserId: id, previousSystems: ['sgq'], newSystems: ['sga'] } });

    expect(await prisma.auditEvent.findMany({ where: { userId: id }, select: { action: true }, orderBy: { createdAt: 'asc' } }))
      .toEqual([{ action: 'auth.registered' }, { action: 'auth.login' }]);
    const deletedAfter = new Date();
    const response = await request(app.getHttpServer()).post('/api/v1/account/delete').set('Cookie', cookie).send({ password }).expect(200);
    expect((response.headers['set-cookie'] as unknown as string[])[0]).toMatch(/^integra_session=;/);
    expect(deleteObject).toHaveBeenCalledWith({ key: `avatars/${id}/photo.png` });
    expect(await prisma.user.count({ where: { id } })).toBe(0);
    expect(await prisma.session.count({ where: { userId: id } })).toBe(0);
    expect(await prisma.customerRequirementResponse.count({ where: { userId: id } })).toBe(0);
    expect(await prisma.customerSystemsChange.count({ where: { targetUserId: id } })).toBe(0);
    await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', cookie).expect(401);
    // The account's own audit trail goes with it; only an anonymous deletion event remains.
    expect(await prisma.auditEvent.count({ where: { userId: id } })).toBe(0);
    expect(await prisma.auditEvent.count({ where: { action: 'account.deleted', userId: null, createdAt: { gte: deletedAfter } } })).toBeGreaterThanOrEqual(1);
  });

  it('deletes nothing when the photo cannot be removed', async () => {
    const { id, cookie } = await account('storage');
    await prisma.customerProfile.update({ where: { userId: id }, data: { avatarObjectKey: `avatars/${id}/photo.png` } });
    deleteObject.mockRejectedValue(new Error('storage down'));
    await request(app.getHttpServer()).post('/api/v1/account/delete').set('Cookie', cookie).send({ password }).expect(503)
      .expect(({ body }) => expect(body.error.code).toBe('ACCOUNT_DELETE_FAILED'));
    expect(await prisma.user.count({ where: { id } })).toBe(1);
  });

  it('refuses to delete an administrator account', async () => {
    const { id, cookie } = await account('admin');
    await prisma.user.update({ where: { id }, data: { isAdmin: true } });
    await request(app.getHttpServer()).post('/api/v1/account/delete').set('Cookie', cookie).send({ password }).expect(403)
      .expect(({ body }) => expect(body.error.code).toBe('ADMIN_ACCOUNT_DELETION_FORBIDDEN'));
    expect(await prisma.user.count({ where: { id } })).toBe(1);
  });

  describe('by an administrator', () => {
    async function admin() {
      const created = await account(`operator-${randomUUID().slice(0, 8)}`);
      await prisma.user.update({ where: { id: created.id }, data: { isAdmin: true } });
      return created;
    }

    it('downloads a customer\'s data and refuses non-administrators and other administrators', async () => {
      const operator = await admin();
      const customer = await account('customer-export');
      const other = await account('not-admin');
      await request(app.getHttpServer()).get(`/api/v1/admin/customers/${customer.id}/export`).set('Cookie', other.cookie).expect(403);

      const response = await request(app.getHttpServer()).get(`/api/v1/admin/customers/${customer.id}/export`).set('Cookie', operator.cookie).expect(200);
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body).toMatchObject({ account: { email: customer.email }, profile: { organization: { name: 'Delete Me Lda' } } });
      expect(response.body.account).not.toHaveProperty('isAdmin');
      expect(await prisma.auditEvent.count({ where: { action: 'admin.customer_exported', userId: operator.id } })).toBe(1);

      const secondAdmin = await admin();
      await request(app.getHttpServer()).get(`/api/v1/admin/customers/${secondAdmin.id}/export`).set('Cookie', operator.cookie).expect(404);
    });

    it('deletes a customer only with the administrator\'s own password', async () => {
      const operator = await admin();
      const customer = await account('customer-delete');
      await prisma.customerProfile.update({ where: { userId: customer.id }, data: { avatarObjectKey: `avatars/${customer.id}/photo.png` } });
      const deleteUrl = `/api/v1/admin/customers/${customer.id}/delete`;

      await request(app.getHttpServer()).post(deleteUrl).set('Cookie', customer.cookie).send({ password }).expect(403);
      await request(app.getHttpServer()).post(deleteUrl).set('Cookie', operator.cookie).send({ password: 'not-the-password' }).expect(401)
        .expect(({ body }) => expect(body.error.code).toBe('INVALID_CURRENT_PASSWORD'));
      expect(await prisma.user.count({ where: { id: customer.id } })).toBe(1);

      const response = await request(app.getHttpServer()).post(deleteUrl).set('Cookie', operator.cookie).send({ password }).expect(200);
      // The administrator stays signed in.
      expect(response.headers['set-cookie']).toBeUndefined();
      expect(deleteObject).toHaveBeenCalledWith({ key: `avatars/${customer.id}/photo.png` });
      expect(await prisma.user.count({ where: { id: customer.id } })).toBe(0);
      await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', customer.cookie).expect(401);
      await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', operator.cookie).expect(200);
      expect(await prisma.auditEvent.count({ where: { action: 'admin.customer_deleted', userId: operator.id } })).toBe(1);
      await request(app.getHttpServer()).post(deleteUrl).set('Cookie', operator.cookie).send({ password }).expect(404);
    });

    it('never deletes another administrator', async () => {
      const operator = await admin();
      const secondAdmin = await admin();
      await request(app.getHttpServer()).post(`/api/v1/admin/customers/${secondAdmin.id}/delete`).set('Cookie', operator.cookie).send({ password }).expect(404)
        .expect(({ body }) => expect(body.error.code).toBe('CUSTOMER_NOT_FOUND'));
      expect(await prisma.user.count({ where: { id: secondAdmin.id } })).toBe(1);
    });
  });
});
