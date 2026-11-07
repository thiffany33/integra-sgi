import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Environment } from '../../config/env.schema';

const DEFAULT_BUCKET = 'sgi';

@Injectable()
export class ObjectStorageService {
  private readonly client: S3Client | null;
  private readonly signer: S3Client | null;
  private readonly bucket: string;

  // Explicit token: scripts run through tsx, which does not emit decorator metadata.
  constructor(@Inject(ConfigService) config: ConfigService<Environment, true>) {
    const accessKeyId = config.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = config.get('AWS_SECRET_ACCESS_KEY');
    const endpoint = config.get('AWS_ENDPOINT_URL_S3');
    const region = config.get('AWS_REGION');
    const publicEndpoint = config.get('AWS_PUBLIC_ENDPOINT_URL_S3');
    this.bucket = config.get('AWS_BUCKET_NAME') || DEFAULT_BUCKET;
    const clientFor = (url: string) => new S3Client({
      endpoint: url,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });

    // Local development may run without object storage; deployed environments require all four values.
    this.client = accessKeyId && secretAccessKey && endpoint && region ? clientFor(endpoint) : null;
    // The host is part of a presigned URL, so sign with the address the browser uses when it differs
    // from the API's (in Docker the API reaches s3mock:9090, the browser localhost:9090).
    this.signer = this.client && publicEndpoint && publicEndpoint !== endpoint ? clientFor(publicEndpoint) : this.client;
  }

  async putObject({ key, body, contentType }: { key: string; body: Uint8Array; contentType: string }): Promise<void> {
    await this.requireClient().send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }));
  }

  async getSignedReadUrl({ key, expiresInSeconds }: { key: string; expiresInSeconds: number }): Promise<string> {
    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > 3600) {
      throw new RangeError('Signed read URL lifetime must be between 1 and 3600 seconds.');
    }
    const client = this.requireClient();
    return getSignedUrl(this.signer ?? client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  async deleteObject({ key }: { key: string }): Promise<void> {
    await this.requireClient().send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  private requireClient(): S3Client {
    if (!this.client) throw new Error('Object storage is not configured.');
    return this.client;
  }
}
