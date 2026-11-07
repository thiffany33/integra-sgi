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
    return this.toExport(user);
  }

  /** An administrator downloads a customer's data, e.g. to answer an access request received by email. */
  async exportCustomer(adminId: string, customerId: string) {
    const user = await this.repository.findExport(customerId);
    if (!user || user.isAdmin) throw customerNotFound();
    await this.audit.record('admin.customer_exported', adminId, { customerId });
    return this.toExport(user);
  }

  async delete(userId: string, password: string, ipAddress: string | undefined): Promise<void> {
    await this.rateLimit.consume('account-delete', ipAddress, userId, 5, 3600);
    const user = await this.repository.findForDeletion(userId);
    if (!user || !(await this.passwords.verify(user.passwordHash, password))) throw invalidPassword();
    // The platform would otherwise lose its administration; another administrator must remove the account.
    if (user.isAdmin) {
      throw new ApiException(HttpStatus.FORBIDDEN, {
        code: 'ADMIN_ACCOUNT_DELETION_FORBIDDEN', message: 'Administrator accounts cannot be deleted from the profile.',
      });
    }
    await this.remove(userId, user.customerProfile?.avatarObjectKey);
    // The account's own events go with it; this one keeps no identifier.
    await this.audit.record('account.deleted', null);
  }

  /** The administrator confirms with their own password; administrator accounts are never removed here. */
  async deleteCustomer(adminId: string, password: string, customerId: string, ipAddress: string | undefined): Promise<void> {
    await this.rateLimit.consume('admin-customer-delete', ipAddress, adminId, 10, 3600);
    const admin = await this.repository.findForDeletion(adminId);
    if (!admin || !(await this.passwords.verify(admin.passwordHash, password))) throw invalidPassword();
    const customer = await this.repository.findForDeletion(customerId);
    if (!customer || customer.isAdmin) throw customerNotFound();
    await this.remove(customerId, customer.customerProfile?.avatarObjectKey);
    await this.audit.record('admin.customer_deleted', adminId);
  }

  private toExport({ isAdmin, ...user }: NonNullable<Awaited<ReturnType<AccountRepository['findExport']>>>) {
    void isAdmin; // Only used to tell customers from administrators; not part of the export.
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

  private async remove(userId: string, avatarKey: string | null | undefined): Promise<void> {
    // Remove the photo first: if storage fails, nothing is deleted and the request can be repeated.
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
  }
}

function invalidPassword() {
  return new ApiException(HttpStatus.UNAUTHORIZED, { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect.' });
}

function customerNotFound() {
  return new ApiException(HttpStatus.NOT_FOUND, { code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found.' });
}
