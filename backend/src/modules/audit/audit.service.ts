import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

export type AuditAction =
  | 'auth.registered'
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.password_changed'
  | 'auth.password_reset'
  | 'account.updated'
  | 'account.exported'
  | 'account.deleted'
  | 'profile.updated'
  | 'profile.photo_uploaded'
  | 'profile.photo_removed';

const RETENTION_DAYS = 365;
const PURGE_INTERVAL_MS = 60 * 60 * 1000;

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private lastPurge = 0;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records an event without ever failing the action that triggered it. Metadata must not contain
   * personal data beyond what the action itself implies (no IPs, emails, or request bodies).
   */
  async record(action: AuditAction, userId: string | null, metadata?: Record<string, string | number | boolean>): Promise<void> {
    try {
      await this.prisma.auditEvent.create({
        data: { action, userId, ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}) },
      });
      await this.purgeExpired();
    } catch (error) {
      this.logger.error(`Audit event ${action} could not be recorded (${error instanceof Error ? error.name : 'unknown'}).`);
    }
  }

  private async purgeExpired(): Promise<void> {
    const now = Date.now();
    if (now - this.lastPurge < PURGE_INTERVAL_MS) return;
    this.lastPurge = now;
    await this.prisma.auditEvent.deleteMany({ where: { createdAt: { lt: new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000) } } });
  }
}
