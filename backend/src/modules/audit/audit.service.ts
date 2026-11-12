import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RetentionService } from '../retention/retention.service';

export type AuditAction =
  | 'auth.registered'
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.password_changed'
  | 'auth.password_reset'
  | 'account.updated'
  | 'account.exported'
  | 'account.terms_accepted'
  | 'account.deleted'
  | 'profile.updated'
  | 'profile.photo_uploaded'
  | 'profile.photo_removed'
  | 'admin.customer_exported'
  | 'admin.customer_deleted';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService, private readonly retention: RetentionService) {}

  /**
   * Records an event without ever failing the action that triggered it. Metadata must not contain
   * personal data beyond what the action itself implies (no IPs, emails, or request bodies).
   */
  async record(action: AuditAction, userId: string | null, metadata?: Record<string, string | number | boolean>): Promise<void> {
    try {
      await this.prisma.auditEvent.create({
        data: { action, userId, ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}) },
      });
    } catch (error) {
      this.logger.error(`Audit event ${action} could not be recorded (${error instanceof Error ? error.name : 'unknown'}).`);
    }
    // Ordinary traffic also clears expired data between the scheduled runs.
    await this.retention.purgeIfDue();
  }
}
