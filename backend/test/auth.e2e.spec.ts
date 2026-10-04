import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EMAIL_SERVICE } from '../src/modules/email/email.service';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import { AuthRepository } from '../src/modules/auth/auth.repository';
import { AuthEmailService } from '../src/modules/auth/auth-email.service';

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
  let registrationUserId: string;
  let accountCookie: string;
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
    registrationUserId = registrationResponse.body.user.id as string;

    const setCookie = registrationResponse.headers['set-cookie'] as string[] | undefined;
    sessionCookie = setCookie?.[0]?.split(';')[0] ?? '';
    rawSessionToken = sessionCookie.split('=')[1] ?? '';
  }, 30_000);

  afterAll(async () => {
    if (prisma && registrationUserId) await prisma.user.deleteMany({ where: { id: registrationUserId } });
    if (app) await app.close();
  });

  it('registers an account and returns no password hash', () => {
    expect(registrationResponse.status).toBe(201);
    expect(registrationResponse.body.user.email).toBe(email);
    expect(registrationResponse.body.user.role).toBe('CUSTOMER');
    expect(registrationResponse.body).not.toHaveProperty('user.passwordHash');
    expect(registrationResponse.body.profile).toEqual(profile);
  });

  it('stores the profile and only a hash of the HTTP-only session cookie', async () => {
    const cookieHeader = registrationResponse.headers['set-cookie']?.[0] as string;
    const storedUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, passwordHash: true, customerProfile: { select: { data: true } } },
    });
    const session = await prisma.session.findFirst({ where: { userId: storedUser!.id } });

    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Lax');
    expect(cookieHeader).not.toContain('Secure');
    expect(storedUser?.passwordHash).not.toBe(password);
    expect(storedUser?.role).toBe('CUSTOMER');
    expect(storedUser?.customerProfile?.data).toEqual(profile);
    expect(session?.tokenHash).toBe(createHash('sha256').update(rawSessionToken).digest('hex'));
    expect(session?.tokenHash).not.toBe(rawSessionToken);
  });

  it('backfills the address of an outstanding legacy verification link', async () => {
    const legacyEmail = `legacy-${randomUUID()}@example.pt`;
    const legacyUser = await prisma.user.create({
      data: { name: 'Legacy account', email: legacyEmail, passwordHash: 'unused', locale: 'pt-PT' },
    });
    const rawToken = randomUUID();
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    try {
      const legacyToken = await prisma.emailVerificationToken.create({
        data: { userId: legacyUser.id, tokenHash, expiresAt: new Date(Date.now() + 60_000), email: null },
      });
      const migrationSql = readFileSync('prisma/migrations/20261004030000_backfill_verification_token_email/migration.sql', 'utf8');
      await prisma.$executeRawUnsafe(migrationSql);
      const backfilled = await prisma.emailVerificationToken.findUniqueOrThrow({ where: { id: legacyToken.id } });
      expect(backfilled.email).toBe(legacyEmail);
      await request(app.getHttpServer()).post('/api/v1/auth/verify-email')
        .send({ token: rawToken }).expect(200);
      const verifiedUser = await prisma.user.findUniqueOrThrow({ where: { id: legacyUser.id } });
      expect(verifiedUser.emailVerifiedAt).toBeInstanceOf(Date);
    } finally {
      await prisma.user.delete({ where: { id: legacyUser.id } });
    }
  });

  it('loads the profile again through login and GET /auth/me', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: email.toUpperCase(), password })
      .expect(200);
    expect(loginResponse.body.user.email).toBe(email);
    expect(loginResponse.body.user.role).toBe('CUSTOMER');
    expect(loginResponse.body.profile).toEqual(profile);
    expect(loginResponse.body.user).not.toHaveProperty('passwordHash');

    const loginCookie = (loginResponse.headers['set-cookie'] as string[])[0].split(';')[0];
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', loginCookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body.profile).toEqual(profile);
        expect(body.user.role).toBe('CUSTOMER');
      });
  });

  it('resolves the current role for an existing session', async () => {
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, password }).expect(200);
    const cookie = (login.headers['set-cookie'] as string[])[0].split(';')[0];
    await prisma.user.update({ where: { id: registrationUserId }, data: { role: 'PLATFORM_ADMIN' } });
    try {
      const me = await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', cookie).expect(200);
      expect(me.body.user.role).toBe('PLATFORM_ADMIN');
    } finally {
      await prisma.user.update({ where: { id: registrationUserId }, data: { role: 'CUSTOMER' } });
    }
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
    const original = profile as {
      organization: { name: string; nif: string; sector: string; email: string };
      representative: { name: string; email: string; phone: string };
    };
    const invalidProfile = { organization: original.organization, representative: original.representative, unexpected: true };
    await request(app.getHttpServer()).put('/api/v1/customers/me').set('Cookie', cookie)
      .send({ revision: 1, profile: invalidProfile }).expect(400);

    const changedProfile = {
      organization: {
        ...original.organization,
        name: 'Integra Atualizada',
      },
      representative: { ...original.representative, name: 'Beatriz Silva' },
    };
    await request(app.getHttpServer()).put('/api/v1/customers/me')
      .set('Cookie', cookie).send({ revision: 1, profile: { ...changedProfile, selectedSystems: ['sgsst'] } })
      .expect(400)
      .expect(({ body }) => expect(body.error.code).toBe('VALIDATION_ERROR'));
    const beforeUpdate = await prisma.user.findUniqueOrThrow({
      where: { email }, select: { customerProfile: { select: { data: true, revision: true } } },
    });
    expect(beforeUpdate.customerProfile?.data).toEqual(profile);
    expect(beforeUpdate.customerProfile?.revision).toBe(1);

    const updated = await request(app.getHttpServer()).put('/api/v1/customers/me')
      .set('Cookie', cookie).send({ revision: 1, profile: changedProfile }).expect(200);
    expect(updated.body.revision).toBe(2);
    expect(updated.body.profile.organization.name).toBe('Integra Atualizada');
    expect(updated.body.profile.representative.name).toBe('Beatriz Silva');
    expect(updated.body.profile.selectedSystems).toEqual(['sgq', 'sga']);
    const stored = await prisma.user.findUniqueOrThrow({
      where: { email }, select: { customerProfile: { select: { data: true, revision: true } } },
    });
    expect(stored.customerProfile?.data).toEqual({ ...profile, ...changedProfile });
    expect(stored.customerProfile?.revision).toBe(2);

    await request(app.getHttpServer()).put('/api/v1/customers/me')
      .set('Cookie', cookie).send({ revision: 1, profile: changedProfile }).expect(409)
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
    const expiredRawToken = randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', '');
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
    await request(app.getHttpServer()).post('/api/v1/auth/verify-email')
      .send({ token: randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', '') }).expect(400);
    const expiredRawToken = randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', '');
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

  it('updates account details, rejects duplicate emails, and sends fresh verification to the new address', async () => {
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, password: 'new-correct-horse-battery' }).expect(200);
    const cookie = (login.headers['set-cookie'] as string[])[0].split(';')[0];
    accountCookie = cookie;
    const duplicateEmail = `duplicate-${email}`;
    const duplicate = await prisma.user.create({ data: {
      name: 'Duplicate', email: duplicateEmail, passwordHash: 'unused', locale: 'pt-PT',
    } });
    try {
      await request(app.getHttpServer()).patch('/api/v1/auth/me').set('Cookie', cookie)
        .send({ name: 'Ana Maria', email: duplicateEmail.toUpperCase() }).expect(409)
        .expect(({ body }) => expect(body.error.code).toBe('EMAIL_ALREADY_EXISTS'));
      await request(app.getHttpServer()).patch('/api/v1/auth/me').set('Cookie', cookie)
        .send({ name: 'Ana Maria', email, role: 'admin' }).expect(400);
    } finally {
      await prisma.user.delete({ where: { id: duplicate.id } });
    }

    const newEmail = `changed-${email}`;
    const response = await request(app.getHttpServer()).patch('/api/v1/auth/me').set('Cookie', cookie)
      .send({ name: ' Ana Maria ', email: newEmail.toUpperCase() }).expect(200);
    expect(response.body).toEqual({ user: expect.objectContaining({ name: 'Ana Maria', email: newEmail, emailVerifiedAt: null }) });
    expect(response.body.user).not.toHaveProperty('passwordHash');
    const stored = await prisma.user.findUniqueOrThrow({ where: { email: newEmail } });
    expect(stored.emailVerifiedAt).toBeNull();
    const verification = sentEmails.findLast((message) => message.to === newEmail && message.html.includes('/verify-email?token='));
    expect(verification).toBeDefined();
    await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', cookie).expect(200)
      .expect(({ body }) => expect(body.user.email).toBe(newEmail));
    email = newEmail;
  });

  it('rejects a stale verification token even when its email is sent after a newer account update', async () => {
    const intermediateEmail = `intermediate-${email}`;
    const finalEmail = `final-${email}`;
    let signalStarted!: () => void;
    const started = new Promise<void>((resolve) => { signalStarted = resolve; });
    let releaseSend!: () => void;
    const waitForRelease = new Promise<void>((resolve) => { releaseSend = resolve; });
    const emailService = app.get(AuthEmailService);
    const originalSend = emailService.sendVerification.bind(emailService);
    const preparedEmailService = emailService as AuthEmailService & {
      sendPreparedVerification?: (address: string, locale: string, token: string) => Promise<void>;
    };
    const originalPreparedSend = preparedEmailService.sendPreparedVerification?.bind(emailService);
    const waitIfIntermediate = async (address: string) => {
      if (address === intermediateEmail) {
        signalStarted();
        await waitForRelease;
      }
    };
    emailService.sendVerification = async (userId, address, locale) => {
      await waitIfIntermediate(address);
      return originalSend(userId, address, locale);
    };
    if (originalPreparedSend) {
      preparedEmailService.sendPreparedVerification = async (address, locale, token) => {
        await waitIfIntermediate(address);
        return originalPreparedSend(address, locale, token);
      };
    }
    const firstRequest = request(app.getHttpServer()).patch('/api/v1/auth/me').set('Cookie', accountCookie)
      .send({ name: 'Ana Maria', email: intermediateEmail }).then((response) => response);
    await started;
    let secondResponse: request.Response;
    try {
      secondResponse = await request(app.getHttpServer()).patch('/api/v1/auth/me').set('Cookie', accountCookie)
        .send({ name: 'Ana Maria', email: finalEmail });
    } finally {
      releaseSend();
      emailService.sendVerification = originalSend;
      if (originalPreparedSend) preparedEmailService.sendPreparedVerification = originalPreparedSend;
    }
    expect(secondResponse!.status).toBe(200);
    expect((await firstRequest).status).toBe(200);
    const intermediateMessage = sentEmails.findLast((message) => message.to === intermediateEmail)!;
    const finalMessage = sentEmails.findLast((message) => message.to === finalEmail)!;
    const intermediateToken = new URL(intermediateMessage.html.match(/href="([^"]+)"/)![1]).searchParams.get('token');
    const finalToken = new URL(finalMessage.html.match(/href="([^"]+)"/)![1]).searchParams.get('token');
    await request(app.getHttpServer()).post('/api/v1/auth/verify-email')
      .send({ token: intermediateToken }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/auth/verify-email')
      .send({ token: finalToken }).expect(200);
    const user = await prisma.user.findUniqueOrThrow({ where: { email: finalEmail } });
    expect(user.emailVerifiedAt).toBeInstanceOf(Date);
    email = finalEmail;
  });

  it('rolls back the email update if the verification token cannot be stored', async () => {
    const account = await prisma.user.findUniqueOrThrow({ where: { id: registrationUserId } });
    const existingToken = await prisma.emailVerificationToken.findFirstOrThrow({ where: { userId: account.id } });
    const attemptedEmail = `uncommitted-${account.email}`;
    const repository = app.get(AuthRepository);
    await expect(repository.updateAccount(account.id, { name: 'Changed Name', email: attemptedEmail }, {
      tokenHash: existingToken.tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
    })).rejects.toMatchObject({ code: 'P2002' });
    expect(await prisma.user.findUnique({ where: { email: attemptedEmail } })).toBeNull();
    const current = await prisma.user.findUniqueOrThrow({ where: { id: account.id } });
    expect(current.email).toBe(account.email);
    expect(current.name).toBe(account.name);
  });

  it('confirms the current password, revokes all old sessions, and rotates the HTTP-only cookie', async () => {
    const first = await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, password: 'new-correct-horse-battery' }).expect(200);
    const second = await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, password: 'new-correct-horse-battery' }).expect(200);
    const firstCookie = (first.headers['set-cookie'] as string[])[0].split(';')[0];
    const secondCookie = (second.headers['set-cookie'] as string[])[0].split(';')[0];
    await request(app.getHttpServer()).post('/api/v1/auth/me/password').set('Cookie', firstCookie)
      .send({ currentPassword: 'wrong-password', newPassword: 'next-correct-horse-battery' }).expect(401)
      .expect(({ body }) => expect(body.error.code).toBe('INVALID_CURRENT_PASSWORD'));
    await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', firstCookie).expect(200);
    await request(app.getHttpServer()).post('/api/v1/auth/me/password').set('Cookie', firstCookie)
      .send({ currentPassword: 'new-correct-horse-battery', newPassword: 'short' }).expect(400);

    const changed = await request(app.getHttpServer()).post('/api/v1/auth/me/password').set('Cookie', firstCookie)
      .send({ currentPassword: 'new-correct-horse-battery', newPassword: 'next-correct-horse-battery' }).expect(200);
    expect(changed.body).toEqual({ user: expect.objectContaining({ email }) });
    expect(changed.body).not.toHaveProperty('sessionToken');
    expect(changed.body.user).not.toHaveProperty('passwordHash');
    const cookieHeader = (changed.headers['set-cookie'] as string[])[0];
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Lax');
    const newCookie = cookieHeader.split(';')[0];
    expect(newCookie).not.toBe(firstCookie);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(user.passwordHash).toContain('$argon2');
    expect(user.passwordHash).not.toBe('next-correct-horse-battery');
    const active = await prisma.session.findMany({ where: { userId: user.id, revokedAt: null } });
    expect(active).toHaveLength(1);
    expect(active[0].tokenHash).toBe(createHash('sha256').update(newCookie.split('=')[1]).digest('hex'));
    await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', firstCookie).expect(401);
    await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', secondCookie).expect(401);
    await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', newCookie).expect(200);
    await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, password: 'new-correct-horse-battery' }).expect(401);
    await request(app.getHttpServer()).post('/api/v1/auth/login')
      .send({ email, password: 'next-correct-horse-battery' }).expect(200);
  });
});
