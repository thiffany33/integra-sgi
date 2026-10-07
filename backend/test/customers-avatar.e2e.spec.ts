import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomersController } from '../src/modules/customers/customers.controller';
import { CustomersRepository } from '../src/modules/customers/customers.repository';
import { CustomersService } from '../src/modules/customers/customers.service';
import { SessionGuard } from '../src/modules/auth/session.guard';
import { ObjectStorageService } from '../src/modules/storage/object-storage.service';
import { SanitizedExceptionFilter } from '../src/middlewares/sanitized-exception.filter';

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
const webp = Buffer.from('RIFF0000WEBP', 'ascii');

describe('customer avatar HTTP flow', () => {
  let app: INestApplication;
  const profiles = new Map<string, string | null>();
  const putObject = vi.fn(async () => undefined);
  const getSignedReadUrl = vi.fn(async ({ key }: { key: string }) => `https://storage.example/${key}?signature=short`);
  const deleteObject = vi.fn(async () => undefined);

  beforeAll(async () => {
    const repository = {
      getAvatarObjectKey: async (userId: string) => profiles.get(userId) ?? null,
      updateAvatarObjectKey: async (userId: string, key: string | null) => {
        profiles.set(userId, key);
      },
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [CustomersService, { provide: CustomersRepository, useValue: repository }, {
        provide: ObjectStorageService, useValue: { putObject, getSignedReadUrl, deleteObject },
      }],
    }).overrideGuard(SessionGuard).useValue({
      canActivate(context: { switchToHttp(): { getRequest(): { headers: Record<string, string>; userId?: string } } }) {
        const req = context.switchToHttp().getRequest();
        req.userId = req.headers['x-test-user'];
        return Boolean(req.userId);
      },
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new SanitizedExceptionFilter());
    await app.init();
  });

  afterAll(async () => { await app?.close(); });
  beforeEach(() => {
    profiles.clear();
    putObject.mockClear(); putObject.mockImplementation(async () => undefined);
    getSignedReadUrl.mockClear(); getSignedReadUrl.mockImplementation(async ({ key }) => `https://storage.example/${key}?signature=short`);
    deleteObject.mockClear(); deleteObject.mockImplementation(async () => undefined);
  });

  it.each([
    ['JPEG', jpeg, 'image/jpeg', 'photo.jpeg'],
    ['PNG', png, 'image/png', 'photo.png'],
    ['WebP', webp, 'image/webp', 'photo.webp'],
  ])('accepts %s based on its signature and ignores the supplied filename for storage keys', async (_format, bytes, mime, filename) => {
    const response = await request(app.getHttpServer()).post('/api/v1/customers/me/avatar')
      .set('x-test-user', 'customer-a').attach('photo', bytes, { filename, contentType: mime }).expect(201);
    expect(response.body.photoUrl).toMatch(/^https:\/\/storage\.example\/avatars\/customer-a\/[0-9a-f-]+\.(jpeg|png|webp)\?signature=short$/);
    expect(putObject).toHaveBeenCalledWith(expect.objectContaining({ contentType: mime, body: expect.any(Buffer) }));
    expect(putObject.mock.calls[0]?.[0].key).toMatch(/^avatars\/customer-a\/[0-9a-f-]+\.(jpeg|png|webp)$/);
    expect(getSignedReadUrl).toHaveBeenCalledWith({ key: putObject.mock.calls[0]?.[0].key, expiresInSeconds: 120 });
  });

  it.each([
    ['forged MIME type', Buffer.from('not an image'), 'image/png'],
    ['corrupt PNG signature', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]), 'image/png'],
  ])('rejects %s before storage', async (_reason, bytes, mime) => {
    await request(app.getHttpServer()).post('/api/v1/customers/me/avatar').set('x-test-user', 'customer-a')
      .attach('photo', bytes, { filename: 'forged.png', contentType: mime }).expect(400);
    expect(putObject).not.toHaveBeenCalled();
  });

  it('accepts exactly 5 MiB and rejects larger uploads before storage', async () => {
    const exact = Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024 - png.length)]);
    await request(app.getHttpServer()).post('/api/v1/customers/me/avatar').set('x-test-user', 'customer-a')
      .attach('photo', exact, { filename: 'large.png', contentType: 'image/png' }).expect(201);
    expect(putObject).toHaveBeenCalledTimes(1);
    putObject.mockClear();
    const tooLarge = Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024 - png.length + 1)]);
    await request(app.getHttpServer()).post('/api/v1/customers/me/avatar').set('x-test-user', 'customer-a')
      .attach('photo', tooLarge, { filename: 'too-large.png', contentType: 'image/png' }).expect(413);
    expect(putObject).not.toHaveBeenCalled();
  });

  it('signs only the current user key and never accepts a caller supplied key', async () => {
    profiles.set('customer-a', 'avatars/customer-a/private.png');
    profiles.set('customer-b', 'avatars/customer-b/private.png');
    await request(app.getHttpServer()).get('/api/v1/customers/me/avatar').set('x-test-user', 'customer-a')
      .query({ key: 'avatars/customer-b/private.png' }).expect(200)
      .expect(({ body }) => expect(body.photoUrl).toContain('avatars/customer-a/private.png'));
    expect(getSignedReadUrl).toHaveBeenCalledWith({ key: 'avatars/customer-a/private.png', expiresInSeconds: 120 });
    expect(getSignedReadUrl).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'avatars/customer-b/private.png' }));
  });

  it('replaces the profile photo after saving the new object and removes the prior object', async () => {
    profiles.set('customer-a', 'avatars/customer-a/old.png');
    await request(app.getHttpServer()).post('/api/v1/customers/me/avatar').set('x-test-user', 'customer-a')
      .attach('photo', png, { filename: 'new.png', contentType: 'image/png' }).expect(201);
    expect(profiles.get('customer-a')).toBe(putObject.mock.calls[0]?.[0].key);
    expect(deleteObject).toHaveBeenCalledWith({ key: 'avatars/customer-a/old.png' });
  });

  it('restores the previous key and removes the new object when replacement cleanup fails', async () => {
    profiles.set('customer-a', 'avatars/customer-a/old.png');
    deleteObject.mockRejectedValueOnce(new Error('storage unavailable'));
    await request(app.getHttpServer()).post('/api/v1/customers/me/avatar').set('x-test-user', 'customer-a')
      .attach('photo', png, { filename: 'new.png', contentType: 'image/png' }).expect(500);
    expect(profiles.get('customer-a')).toBe('avatars/customer-a/old.png');
    expect(deleteObject).toHaveBeenNthCalledWith(2, { key: putObject.mock.calls[0]?.[0].key });
  });

  it('clears the current user reference and deletes only that object', async () => {
    profiles.set('customer-a', 'avatars/customer-a/current.webp');
    await request(app.getHttpServer()).delete('/api/v1/customers/me/avatar').set('x-test-user', 'customer-a').expect(204);
    expect(profiles.get('customer-a')).toBeNull();
    expect(deleteObject).toHaveBeenCalledWith({ key: 'avatars/customer-a/current.webp' });
  });

  it('restores the saved key when object deletion fails', async () => {
    profiles.set('customer-a', 'avatars/customer-a/current.webp');
    deleteObject.mockRejectedValueOnce(new Error('storage unavailable'));
    await request(app.getHttpServer()).delete('/api/v1/customers/me/avatar').set('x-test-user', 'customer-a').expect(500);
    expect(profiles.get('customer-a')).toBe('avatars/customer-a/current.webp');
  });

  it('compensates the newly stored object when the database update fails', async () => {
    const repository = app.get(CustomersRepository);
    vi.spyOn(repository, 'updateAvatarObjectKey').mockRejectedValueOnce(new Error('database unavailable'));
    const response = await request(app.getHttpServer()).post('/api/v1/customers/me/avatar').set('x-test-user', 'customer-a')
      .attach('photo', png, { filename: 'new.png', contentType: 'image/png' }).expect(500);
    expect(response.body.error).toBeDefined();
    expect(deleteObject).toHaveBeenCalledWith({ key: putObject.mock.calls[0]?.[0].key });
  });

  it('does not update the database when object storage rejects the upload', async () => {
    putObject.mockRejectedValueOnce(new Error('storage unavailable'));
    const repository = app.get(CustomersRepository);
    const update = vi.spyOn(repository, 'updateAvatarObjectKey');
    await request(app.getHttpServer()).post('/api/v1/customers/me/avatar').set('x-test-user', 'customer-a')
      .attach('photo', png, { filename: 'new.png', contentType: 'image/png' }).expect(500);
    expect(update).not.toHaveBeenCalled();
    expect(profiles.get('customer-a')).toBeUndefined();
  });

  it('requires a signed-in user', async () => {
    await request(app.getHttpServer()).get('/api/v1/customers/me/avatar').expect(403);
  });
});
