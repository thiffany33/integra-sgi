import { createHmac } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '../../utils/api-exception';
import { AuthRateLimitRepository } from './auth-rate-limit.repository';

@Injectable()
export class AuthRateLimitService {
  private readonly secret: string;

  constructor(
    private readonly repository: AuthRateLimitRepository,
    configService: ConfigService,
  ) {
    this.secret = configService.getOrThrow<string>('SESSION_SECRET');
  }

  async consume(
    scope: string,
    ipAddress: string | undefined,
    identity: string,
    maxAttempts: number,
    windowSeconds: number,
  ): Promise<void> {
    const key = createHmac('sha256', this.secret)
      .update(`${scope}\n${ipAddress ?? 'unknown'}\n${identity}`)
      .digest('hex');
    const now = new Date();
    const windowMilliseconds = windowSeconds * 1000;
    const count = await this.repository.consume(
      key,
      now,
      new Date(now.getTime() - windowMilliseconds),
      new Date(now.getTime() + windowMilliseconds),
    );

    if (count > maxAttempts) {
      throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
      });
    }
  }
}
