import { createHash, timingSafeEqual } from 'node:crypto';
import { Controller, Header, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { ApiException } from '../../utils/api-exception';
import { RetentionService, type PurgeResult } from './retention.service';

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/** Called every 15 minutes by the scheduled workflow, so expired data goes even when nobody uses the platform. */
@Controller('internal/retention')
export class RetentionController {
  private readonly secret: string | undefined;

  constructor(private readonly retention: RetentionService, config: ConfigService) {
    this.secret = config.get<string>('RETENTION_JOB_SECRET');
  }

  @Post('purge')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  purge(@Req() request: Request): Promise<PurgeResult> {
    if (!this.secret) throw new ApiException(HttpStatus.NOT_FOUND, { code: 'NOT_FOUND', message: 'Not found.' });
    const header = request.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
    // Digests have equal length, so the comparison takes the same time whatever the token.
    if (!timingSafeEqual(digest(token), digest(this.secret))) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, { code: 'UNAUTHENTICATED', message: 'Invalid retention job credentials.' });
    }
    return this.retention.purgeExpired();
  }
}
