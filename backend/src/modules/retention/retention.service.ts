import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

/** Retention periods from the data retention policy (docs/SECURITY.md §6). */
export const AUDIT_RETENTION_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;
const OPPORTUNISTIC_INTERVAL_MS = 15 * 60 * 1000;

export type PurgeResult = { rateLimitBuckets: number; sessions: number; passwordResetTokens: number; emailVerificationTokens: number; auditEvents: number };

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);
  private lastRun = 0;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Deletes what no longer has a purpose: rate-limit buckets past their window (at most 1 hour),
   * expired or revoked sessions (at most 7 days), used or expired one-time tokens, and audit
   * events older than 12 months.
   */
  async purgeExpired(now = new Date()): Promise<PurgeResult> {
    const [rateLimitBuckets, sessions, passwordResetTokens, emailVerificationTokens, auditEvents] = await this.prisma.$transaction([
      this.prisma.authRateLimitBucket.deleteMany({ where: { expiresAt: { lt: now } } }),
      this.prisma.session.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { revokedAt: { not: null } }] } }),
      this.prisma.passwordResetToken.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }] } }),
      this.prisma.emailVerificationToken.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }] } }),
      this.prisma.auditEvent.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - AUDIT_RETENTION_DAYS * DAY_MS) } } }),
    ]);
    return {
      rateLimitBuckets: rateLimitBuckets.count, sessions: sessions.count, passwordResetTokens: passwordResetTokens.count,
      emailVerificationTokens: emailVerificationTokens.count, auditEvents: auditEvents.count,
    };
  }

  /** Runs the purge at most every 15 minutes per instance, on ordinary traffic; never fails the caller. */
  async purgeIfDue(): Promise<void> {
    const now = Date.now();
    if (now - this.lastRun < OPPORTUNISTIC_INTERVAL_MS) return;
    this.lastRun = now;
    try {
      await this.purgeExpired(new Date(now));
    } catch (error) {
      this.logger.error(`Retention purge failed (${error instanceof Error ? error.name : 'unknown'}).`);
    }
  }
}
