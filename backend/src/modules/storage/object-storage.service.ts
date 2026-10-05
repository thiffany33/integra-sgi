import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Environment } from '../../config/env.schema';

const BUCKET = 'sgi';

@Injectable()
export class ObjectStorageService {
  private readonly client: S3Client | null;

  constructor(config: ConfigService<Environment, true>) {
    const accessKeyId = config.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = config.get('AWS_SECRET_ACCESS_KEY');
    const endpoint = config.get('AWS_ENDPOINT_URL_S3');
    const region = config.get('AWS_REGION');

    // Local development may run without object storage; deployed environments require all four values.
    this.client = accessKeyId && secretAccessKey && endpoint && region
      ? new S3Client({
        endpoint,
        region,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
      })
      : null;
  }

  async putObject({ key, body, contentType }: { key: string; body: Uint8Array; contentType: string }): Promise<void> {
    await this.requireClient().send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  }

  async getSignedReadUrl({ key, expiresInSeconds }: { key: string; expiresInSeconds: number }): Promise<string> {
    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > 3600) {
      throw new RangeError('Signed read URL lifetime must be between 1 and 3600 seconds.');
    }
    return getSignedUrl(this.requireClient(), new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  async deleteObject({ key }: { key: string }): Promise<void> {
    await this.requireClient().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  }

  private requireClient(): S3Client {
    if (!this.client) throw new Error('Object storage is not configured.');
    return this.client;
  }
}
