import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AuthRateLimitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async consume(key: string, now: Date, cutoff: Date, expiresAt: Date): Promise<number> {
    const buckets = await this.prisma.$queryRaw<Array<{ count: number }>>`
      WITH expired AS (
        DELETE FROM "AuthRateLimitBucket"
        WHERE "expiresAt" < ${now}
      )
      INSERT INTO "AuthRateLimitBucket" (
        "key", "windowStartedAt", "expiresAt", "count", "createdAt", "updatedAt"
      )
      VALUES (${key}, ${now}, ${expiresAt}, 1, ${now}, ${now})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "AuthRateLimitBucket"."windowStartedAt" <= ${cutoff} THEN 1
          ELSE "AuthRateLimitBucket"."count" + 1
        END,
        "windowStartedAt" = CASE
          WHEN "AuthRateLimitBucket"."windowStartedAt" <= ${cutoff} THEN ${now}
          ELSE "AuthRateLimitBucket"."windowStartedAt"
        END,
        "expiresAt" = ${expiresAt},
        "updatedAt" = ${now}
      RETURNING "count"
    `;

    return buckets[0]?.count ?? 0;
  }
}
