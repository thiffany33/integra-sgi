import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AuthRateLimitService } from '../auth/auth-rate-limit.service';
import { PasswordHashingService } from '../auth/password-hashing.service';
import { ObjectStorageService } from '../storage/object-storage.service';
import { ApiException } from '../../utils/api-exception';
import { AuditService } from '../audit/audit.service';
import { AccountRepository } from './account.repository';

const EXPORT_SCHEMA_VERSION = 1;

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly repository: AccountRepository,
    private readonly passwords: PasswordHashingService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly storage: ObjectStorageService,
    private readonly audit: AuditService,
  ) {}

  async export(userId: string) {
    const user = await this.repository.findExport(userId);
    if (!user) throw new ApiException(HttpStatus.UNAUTHORIZED, { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' });
    await this.audit.record('account.exported', userId);
    const { customerProfile, requirementResponses, guidedFlows, systemChangesReceived, ...account } = user;
    return {
      schemaVersion: EXPORT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      account,
      profile: customerProfile ? {
        ...(customerProfile.data as Record<string, unknown>),
        // The photo itself can be downloaded from the profile page while it is stored.
        hasProfilePhoto: Boolean(customerProfile.avatarObjectKey),
        createdAt: customerProfile.createdAt,
        updatedAt: customerProfile.updatedAt,
      } : null,
      guidedFlows,
      requirementResponses,
      selectedSystemsHistory: systemChangesReceived,
    };
  }

  async delete(userId: string, password: string, ipAddress: string | undefined): Promise<void> {
    await this.rateLimit.consume('account-delete', ipAddress, userId, 5, 3600);
    const user = await this.repository.findForDeletion(userId);
    if (!user || !(await this.passwords.verify(user.passwordHash, password))) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect.' });
    }
    // The platform would otherwise lose its administration; another administrator must remove the account.
    if (user.isAdmin) {
      throw new ApiException(HttpStatus.FORBIDDEN, {
        code: 'ADMIN_ACCOUNT_DELETION_FORBIDDEN', message: 'Administrator accounts cannot be deleted from the profile.',
      });
    }
    const avatarKey = user.customerProfile?.avatarObjectKey;
    // Remove the photo first: if storage fails, nothing is deleted and the person can try again.
    if (avatarKey) {
      try {
        await this.storage.deleteObject({ key: avatarKey });
      } catch (error) {
        this.logger.error(`Account deletion stopped: profile photo delete failed (${error instanceof Error ? error.name : 'unknown'}).`);
        throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, {
          code: 'ACCOUNT_DELETE_FAILED', message: 'The account could not be deleted. Please try again.',
        });
      }
    }
    await this.repository.deleteUser(userId);
    // The account's own events go with it; this one keeps no identifier.
    await this.audit.record('account.deleted', null);
  }
}
