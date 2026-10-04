import { createHash, randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EMAIL_SERVICE } from '../src/modules/email/email.service';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/infra/prisma/prisma.service';

const databaseUrl = 'postgresql://postgres:postgres@localhost:5432/integra_sgi';
const sessionSecret = 'test-session-secret-with-at-least-thirty-two-characters';

describe('authentication HTTP flow', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let email: string;
  let password: string;
  let profile: Record<string, unknown>;
  let registrationResponse: request.Response;
  let sessionCookie: string;
  let rawSessionToken: string;
  const sentEmails: Array<{ to: string; subject: string; html: string; text: string }> = [];

  beforeAll(async () => {
    process.env.APP_ENV = 'test';
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = databaseUrl;
    process.env.DIRECT_URL = databaseUrl;
    process.env.SESSION_SECRET = sessionSecret;
    process.env.APP_URL = 'http://localhost:5173';
    process.env.FRONTEND_URL = 'http://localhost:5173';

    const { AppModule } = await import('../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMAIL_SERVICE)
      .useValue({ send: async (message: (typeof sentEmails)[number]) => { sentEmails.push(message); } })
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    email = `auth-test-${randomUUID()}@example.pt`;
    password = 'correct-horse-battery-staple';
    profile = {
      schemaVersion: 1,
      organization: { name: 'Integra Teste', nif: '123456789', sector: 'Serviços', email: 'contact@example.pt' },
      representative: { name: 'Ana Silva', email: '', phone: '' },
      selectedSystems: ['sgq', 'sga'],
    };
    registrationResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ name: 'Ana Silva', email: email.toUpperCase(), password, locale: 'pt-PT', profile });

    const setCookie = registrationResponse.headers['set-cookie'] as string[] | undefined;
    sessionCookie = setCookie?.[0]?.split(';')[0] ?? '';
    rawSessionToken = sessionCookie.split('=')[1] ?? '';
  }, 30_000);

  afterAll(async () => {
    if (prisma && email) await prisma.user.deleteMany({ where: { email } });
    if (app) await app.close();
  });

  it('registers an account and returns no password hash', () => {
    expect(registrationResponse.status).toBe(201);
    expect(registrationResponse.body.user.email).toBe(email);
    expect(registrationResponse.body).not.toHaveProperty('user.passwordHash');
    expect(registrationResponse.body.profile).toEqual(profile);
  });

  it('stores the profile and only a hash of the HTTP-only session cookie', async () => {
    const cookieHeader = registrationResponse.headers['set-cookie']?.[0] as string;
    const storedUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, customerProfile: { select: { data: true } } },
    });
    const session = await prisma.session.findFirst({ where: { userId: storedUser!.id } });

    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Lax');
    expect(cookieHeader).not.toContain('Secure');
    expect(storedUser?.passwordHash).not.toBe(password);
    expect(storedUser?.customerProfile?.data).toEqual(profile);
    expect(session?.tokenHash).toBe(createHash('sha256').update(rawSessionToken).digest('hex'));
    expect(session?.tokenHash).not.toBe(rawSessionToken);
  });

  it('loads the profile again through login and GET /auth/me', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: email.toUpperCase(), password })
      .expect(200);
    expect(loginResponse.body.user.email).toBe(email);
    expect(loginResponse.body.profile).toEqual(profile);
    expect(loginResponse.body.user).not.toHaveProperty('passwordHash');

    const loginCookie = (loginResponse.headers['set-cookie'] as string[])[0].split(';')[0];
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', loginCookie)
      .expect(200)
      .expect(({ body }) => expect(body.profile).toEqual(profile));
  });

  it('uses one generic error for invalid credentials and rejects expired sessions', async () => {
    const invalid = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
    expect(invalid.body).toEqual({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });

    const tokenHash = createHash('sha256').update(rawSessionToken).digest('hex');
    await prisma.session.update({
      where: { tokenHash },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', sessionCookie)
      .expect(401)
      .expect(({ body }) => expect(body.error.code).toBe('UNAUTHENTICATED'));
  });

  it('revokes the session on logout and clears the cookie', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);
    const cookie = (loginResponse.headers['set-cookie'] as string[])[0].split(';')[0];
    const logoutResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Cookie', cookie)
      .expect(200);
    expect(logoutResponse.headers['set-cookie']?.[0]).toContain('integra_session=;');
    expect(logoutResponse.headers['set-cookie']?.[0]).toContain('Expires=Thu, 01 Jan 1970');
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(401);
  });

  it('protects profile reads and updates with ownership and optimistic revisions', async () => {
    await request(app.getHttpServer()).get('/api/v1/customers/me').expect(401);
    const freshLogin = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password }).expect(200);
    const cookie = (freshLogin.headers['set-cookie'] as string[])[0].split(';')[0];
    const invalidProfile = { ...profile, unexpected: true };
    await request(app.getHttpServer()).put('/api/v1/customers/me').set('Cookie', cookie)
      .send({ revision: 1, profile: invalidProfile }).expect(400);

    const changedProfile = {
      ...profile,
      organization: {
        ...((profile as { organization: Record<string, unknown> }).organization),
        name: 'Integra Atualizada',
      },
    };
    const updated = await request(app.getHttpServer()).put('/api/v1/customers/me')
      .set('Cookie', cookie).send({ revision: 1, profile: changedProfile }).expect(200);
    expect(updated.body.revision).toBe(2);
    expect(updated.body.profile.organization.name).toBe('Integra Atualizada');

    await request(app.getHttpServer()).put('/api/v1/customers/me')
      .set('Cookie', cookie).send({ revision: 1, profile }).expect(409)
      .expect(({ body }) => expect(body.error.code).toBe('PROFILE_REVISION_CONFLICT'));
  });

  it('requires a session and filters requirement guidance using only the signed-in profile', async () => {
    await request(app.getHttpServer()).get('/api/v1/requirements').expect(401);
    const loginResponse = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password }).expect(200);
    const cookie = (loginResponse.headers['set-cookie'] as string[])[0].split(';')[0];
    const response = await request(app.getHttpServer()).get('/api/v1/requirements?userId=another-account')
      .set('Cookie', cookie).expect(200);
    expect(response.body.selectedSystems).toEqual(['sgq', 'sga']);
    expect(response.body.commonRequirements).toContain('/requirement4');
    expect(response.body.specializedRequirements).toEqual([
      { key: 'sgq', route: '/requirement6_1_quality' },
      { key: 'sga', route: '/requirement6_1_environment' },
    ]);
    expect(response.body.specializedRequirements).not.toContainEqual({ key: 'sgsst', route: '/requirement6_1_sst' });
  });

  it('sends the same password-recovery response for known and unknown addresses, and uses reset tokens once', async () => {
    const known = await request(app.getHttpServer()).post('/api/v1/auth/forgot-password').send({ email }).expect(200);
    const unknown = await request(app.getHttpServer()).post('/api/v1/auth/forgot-password')
      .send({ email: `missing-${email}` }).expect(200);
    expect(known.body).toEqual(unknown.body);
    expect(known.body.message).toContain('If this email exists');
    const resetEmail = sentEmails.findLast((message) => message.subject === 'Repor a palavra-passe');
    expect(resetEmail?.to).toBe(email);
    const resetUrl = new URL(resetEmail!.html.match(/href="([^"]+)"/)![1]);
    const token = resetUrl.searchParams.get('token')!;
    const storedToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: createHash('sha256').update(token).digest('hex') },
    });
    expect(storedToken?.tokenHash).not.toBe(token);
    expect(storedToken!.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(30 * 60 * 1000);

    await request(app.getHttpServer()).post('/api/v1/auth/reset-password')
      .send({ token, password: 'new-correct-horse-battery' }).expect(200);
    await request(app.getHttpServer()).post('/api/v1/auth/reset-password')
      .send({ token, password: 'another-correct-horse' }).expect(400);
    const expiredRawToken = 'y'.repeat(64);
    const user = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
    await prisma.passwordResetToken.create({ data: {
      userId: user.id,
      tokenHash: createHash('sha256').update(expiredRawToken).digest('hex'),
      expiresAt: new Date(Date.now() - 1000),
    } });
    await request(app.getHttpServer()).post('/api/v1/auth/reset-password')
      .send({ token: expiredRawToken, password: 'expired-correct-horse' }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, password }).expect(401);
    await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, password: 'new-correct-horse-battery' }).expect(200);
  });

  it('verifies email once and stores only a verification token hash', async () => {
    const verificationEmail = sentEmails.find((message) => message.subject === 'Confirme o seu email');
    const verificationUrl = new URL(verificationEmail!.html.match(/href="([^"]+)"/)![1]);
    const token = verificationUrl.searchParams.get('token')!;
    const tokenHash = createHash('sha256').update(token).digest('hex');
    expect(await prisma.emailVerificationToken.findUnique({ where: { tokenHash } })).toMatchObject({ tokenHash });
    await request(app.getHttpServer()).post('/api/v1/auth/verify-email').send({ token }).expect(200);
    await request(app.getHttpServer()).post('/api/v1/auth/verify-email').send({ token }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/auth/verify-email').send({ token: 'z'.repeat(64) }).expect(400);
    const expiredRawToken = 'w'.repeat(64);
    const user = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
    await prisma.emailVerificationToken.create({ data: {
      userId: user.id,
      tokenHash: createHash('sha256').update(expiredRawToken).digest('hex'),
      expiresAt: new Date(Date.now() - 1000),
    } });
    await request(app.getHttpServer()).post('/api/v1/auth/verify-email').send({ token: expiredRawToken }).expect(400);
    const verifiedUser = await prisma.user.findUnique({ where: { email } });
    expect(verifiedUser?.emailVerifiedAt).toBeInstanceOf(Date);
  });

  it('updates the authenticated account language and reports it from /auth/me', async () => {
    const loginResponse = await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, password: 'new-correct-horse-battery' }).expect(200);
    const cookie = (loginResponse.headers['set-cookie'] as string[])[0].split(';')[0];
    await request(app.getHttpServer()).patch('/api/v1/auth/me/locale')
      .set('Cookie', cookie).send({ locale: 'pt-BR' }).expect(400);
    await request(app.getHttpServer()).patch('/api/v1/auth/me/locale')
      .set('Cookie', cookie).send({ locale: 'de' }).expect(200)
      .expect(({ body }) => expect(body.user.locale).toBe('de'));
    await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', cookie).expect(200)
      .expect(({ body }) => expect(body.user.locale).toBe('de'));
  });
});
