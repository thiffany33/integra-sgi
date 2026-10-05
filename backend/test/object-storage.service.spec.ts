import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import { ObjectStorageService } from '../src/modules/storage/object-storage.service';

const s3Mocks = vi.hoisted(() => ({
  send: vi.fn(),
  client: vi.fn(),
  signedUrl: vi.fn(),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = s3Mocks.send;
    constructor(options: unknown) { s3Mocks.client(options); }
  },
  PutObjectCommand: class { constructor(readonly input: unknown) {} },
  GetObjectCommand: class { constructor(readonly input: unknown) {} },
  DeleteObjectCommand: class { constructor(readonly input: unknown) {} },
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: s3Mocks.signedUrl }));

const config = {
  AWS_ACCESS_KEY_ID: 'test-access-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret-key',
  AWS_ENDPOINT_URL_S3: 'https://storage.example.test',
  AWS_REGION: 'us-east-2',
};

function service() {
  return new ObjectStorageService({ get: (key: keyof typeof config) => config[key] } as ConfigService);
}

describe('ObjectStorageService', () => {
  beforeEach(() => {
    s3Mocks.send.mockReset().mockResolvedValue({});
    s3Mocks.client.mockClear();
    s3Mocks.signedUrl.mockReset().mockResolvedValue('https://storage.example.test/signed');
  });

  it('uses validated backend credentials and path-style S3 addressing', () => {
    service();
    expect(s3Mocks.client).toHaveBeenCalledWith({
      endpoint: config.AWS_ENDPOINT_URL_S3,
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  });

  it('uploads into the private sgi bucket', async () => {
    const body = new Uint8Array([1, 2, 3]);
    await service().putObject({ key: 'avatars/user/photo.png', body, contentType: 'image/png' });
    expect(s3Mocks.send).toHaveBeenCalledWith(expect.objectContaining({ input: {
      Bucket: 'sgi', Key: 'avatars/user/photo.png', Body: body, ContentType: 'image/png',
    } }));
  });

  it('presigns a read for the requested short lifetime', async () => {
    const result = await service().getSignedReadUrl({ key: 'templates/one/file.pdf', expiresInSeconds: 120 });
    expect(result).toBe('https://storage.example.test/signed');
    expect(s3Mocks.signedUrl).toHaveBeenCalledWith(expect.objectContaining({ send: s3Mocks.send }),
      expect.objectContaining({ input: { Bucket: 'sgi', Key: 'templates/one/file.pdf' } }),
      { expiresIn: 120 });
  });

  it('deletes an object from the private sgi bucket', async () => {
    await service().deleteObject({ key: 'avatars/user/photo.png' });
    expect(s3Mocks.send).toHaveBeenCalledWith(expect.objectContaining({ input: {
      Bucket: 'sgi', Key: 'avatars/user/photo.png',
    } }));
  });

  it('propagates upload failures to callers so they can clean up database state', async () => {
    s3Mocks.send.mockRejectedValueOnce(new Error('storage unavailable'));
    await expect(service().putObject({ key: 'avatars/user/photo.png', body: new Uint8Array(), contentType: 'image/png' }))
      .rejects.toThrow('storage unavailable');
  });

  it('propagates signed-read failures', async () => {
    s3Mocks.signedUrl.mockRejectedValueOnce(new Error('presigning failed'));
    await expect(service().getSignedReadUrl({ key: 'templates/one/file.pdf', expiresInSeconds: 300 }))
      .rejects.toThrow('presigning failed');
  });

  it('propagates delete failures', async () => {
    s3Mocks.send.mockRejectedValueOnce(new Error('delete failed'));
    await expect(service().deleteObject({ key: 'avatars/user/photo.png' })).rejects.toThrow('delete failed');
  });

  it('rejects storage operations when local storage has no credentials', async () => {
    const unconfigured = new ObjectStorageService({ get: () => undefined } as unknown as ConfigService);
    await expect(unconfigured.deleteObject({ key: 'avatars/user/photo.png' }))
      .rejects.toThrow('Object storage is not configured.');
  });
});
