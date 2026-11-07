import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { filesManifest } from '@integra/shared/documents';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { ObjectStorageService } from '../src/modules/storage/object-storage.service';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readdirSync } from 'node:fs';

function hasAsset(root: string, filename: string): boolean {
  return readdirSync(root, { withFileTypes: true }).some((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? hasAsset(path, filename) : entry.name === filename && existsSync(path);
  });
}

describe('private template downloads', () => {
  let app: INestApplication;
  const getSignedReadUrl = vi.fn(async ({ key }: { key: string }) => `https://storage.example/${key}?signature=mock`);

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
      .overrideProvider(AuthService)
      .useValue({ validateSession: async (token: string) => token === 'valid'
        ? { userId: 'test-user', isAdmin: false }
        : null })
      .overrideProvider(ObjectStorageService)
      .useValue({ getSignedReadUrl })
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => app?.close());

  it('rejects anonymous requests', async () => {
    await request(app.getHttpServer()).get(`/api/v1/files/templates/${filesManifest[0].id}`).expect(401);
  });

  it('redirects a known template to a signed URL valid for five minutes', async () => {
    const document = filesManifest[0];
    const response = await request(app.getHttpServer()).get(`/api/v1/files/templates/${document.id}`)
      .set('Cookie', 'integra_session=valid').expect(302);
    expect(response.headers.location).toContain('signature=mock');
    expect(getSignedReadUrl).toHaveBeenCalledWith({ key: document.objectKey, expiresInSeconds: 300 });
  });

  it('counts a customer\'s download for the indicators, and still downloads if counting fails', async () => {
    const prisma = app.get(PrismaService);
    const document = filesManifest[1];
    await prisma.user.deleteMany({ where: { id: 'test-user' } });
    // Without the account row the count fails on its foreign key; the download must not.
    await request(app.getHttpServer()).get(`/api/v1/files/templates/${document.id}`).set('Cookie', 'integra_session=valid').expect(302);
    await prisma.user.create({ data: { id: 'test-user', name: 'Files Test', email: `files-${Date.now()}@example.pt`, passwordHash: 'x' } });
    try {
      await request(app.getHttpServer()).get(`/api/v1/files/templates/${document.id}`).set('Cookie', 'integra_session=valid').expect(302);
      expect(await prisma.templateDownload.findMany({ where: { userId: 'test-user' }, select: { documentId: true } })).toEqual([{ documentId: document.id }]);
    } finally {
      await prisma.user.deleteMany({ where: { id: 'test-user' } });
    }
  });

  it('returns 404 for an unknown document ID', async () => {
    await request(app.getHttpServer()).get('/api/v1/files/templates/not-a-template')
      .set('Cookie', 'integra_session=valid').expect(404);
  });

  it('has a backend source asset for every manifest entry', () => {
    for (const document of filesManifest) {
      expect(hasAsset(join(process.cwd(), 'assets/documents'), document.filename)).toBe(true);
    }
  });
});
