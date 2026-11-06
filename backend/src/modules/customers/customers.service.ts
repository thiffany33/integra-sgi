import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { UpdateCustomerProfileInput } from '@integra/shared/auth';
import { MAX_PROFILE_PHOTO_BYTES } from '@integra/shared/profile';
import { ApiException } from '../../utils/api-exception';
import { ObjectStorageService } from '../storage/object-storage.service';
import { CustomersRepository } from './customers.repository';

const AVATAR_URL_TTL_SECONDS = 120;
const imageFormats = [
  { extension: 'jpeg', contentType: 'image/jpeg', matches: (bytes: Buffer) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  { extension: 'png', contentType: 'image/png', matches: (bytes: Buffer) => bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { extension: 'webp', contentType: 'image/webp', matches: (bytes: Buffer) => bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' },
] as const;

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly repository: CustomersRepository, private readonly storage: ObjectStorageService) {}

  async getMe(userId: string) {
    const profile = await this.repository.getProfile(userId);
    if (!profile) throw this.notFound();
    return { profile: profile.data, revision: profile.revision, updatedAt: profile.updatedAt };
  }

  async updateMe(userId: string, input: UpdateCustomerProfileInput) {
    const profile = await this.repository.updateProfile(userId, input.revision, input.profile);
    if (!profile) {
      throw new ApiException(HttpStatus.CONFLICT, {
        code: 'PROFILE_REVISION_CONFLICT',
        message: 'This profile changed elsewhere. Reload it and try again.',
      });
    }
    return { profile: profile.data, revision: profile.revision, updatedAt: profile.updatedAt };
  }

  async getAvatar(userId: string): Promise<{ photoUrl: string | null }> {
    const key = await this.repository.getAvatarObjectKey(userId);
    if (!key) return { photoUrl: null };
    try {
      return { photoUrl: await this.storage.getSignedReadUrl({ key, expiresInSeconds: AVATAR_URL_TTL_SECONDS }) };
    } catch (error) {
      this.logStorageFailure('sign read URL', error);
      throw this.storageUnavailable();
    }
  }

  async uploadAvatar(userId: string, photo: { buffer: Buffer; size: number } | undefined): Promise<{ photoUrl: string }> {
    if (!photo || photo.size < 1 || photo.size > MAX_PROFILE_PHOTO_BYTES) throw this.invalidPhoto();
    const format = imageFormats.find((candidate) => candidate.matches(photo.buffer));
    if (!format) throw this.invalidPhoto();

    const previousKey = await this.repository.getAvatarObjectKey(userId);
    const key = `avatars/${userId}/${randomUUID()}.${format.extension}`;
    try {
      await this.storage.putObject({ key, body: photo.buffer, contentType: format.contentType });
    } catch (error) {
      this.logStorageFailure('upload', error);
      throw this.storageUnavailable();
    }
    let changed: boolean;
    try {
      changed = await this.repository.compareAndSwapAvatarObjectKey(userId, previousKey, key);
    } catch {
      try { await this.storage.deleteObject({ key }); } catch { /* preserve the database error response; object cleanup is best effort */ }
      throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, {
        code: 'PROFILE_PHOTO_SAVE_FAILED', message: 'Unable to save profile photo. Please try again.',
      });
    }
    if (!changed) {
      try { await this.storage.deleteObject({ key }); } catch { /* cleanup is best effort after losing the profile race */ }
      throw this.avatarConflict();
    }

    if (previousKey && previousKey !== key) {
      try {
        await this.storage.deleteObject({ key: previousKey });
      } catch {
        let rolledBack = false;
        try { rolledBack = await this.repository.compareAndSwapAvatarObjectKey(userId, key, previousKey); } catch { /* best-effort reference recovery */ }
        if (rolledBack) {
          try { await this.storage.deleteObject({ key }); } catch { /* best-effort uploaded-object cleanup */ }
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, {
          code: 'PROFILE_PHOTO_REPLACE_FAILED', message: 'Unable to replace profile photo. Please try again.',
        });
      }
    }
    try {
      return { photoUrl: await this.storage.getSignedReadUrl({ key, expiresInSeconds: AVATAR_URL_TTL_SECONDS }) };
    } catch (error) {
      this.logStorageFailure('sign read URL', error);
      throw this.storageUnavailable();
    }
  }

  async deleteAvatar(userId: string): Promise<void> {
    const key = await this.repository.getAvatarObjectKey(userId);
    if (!key) return;
    let changed: boolean;
    try { changed = await this.repository.compareAndSwapAvatarObjectKey(userId, key, null); } catch {
      throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, {
        code: 'PROFILE_PHOTO_DELETE_FAILED', message: 'Unable to remove profile photo. Please try again.',
      });
    }
    if (!changed) throw this.avatarConflict();
    try {
      await this.storage.deleteObject({ key });
    } catch (error) {
      this.logStorageFailure('delete', error);
      try { await this.repository.compareAndSwapAvatarObjectKey(userId, null, key); } catch { /* best-effort reference recovery */ }
      throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, {
        code: 'PROFILE_PHOTO_DELETE_FAILED', message: 'Unable to remove profile photo. Please try again.',
      });
    }
  }

  private invalidPhoto() {
    return new ApiException(HttpStatus.BAD_REQUEST, {
      code: 'INVALID_PROFILE_PHOTO', message: 'Choose a JPEG, PNG or WebP image up to 4 MiB.',
    });
  }

  private storageUnavailable() {
    return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, {
      code: 'PROFILE_PHOTO_STORAGE_UNAVAILABLE', message: 'Profile photo storage is temporarily unavailable.',
    });
  }

  private logStorageFailure(operation: string, error: unknown): void {
    const record = typeof error === 'object' && error !== null ? error as Record<string, unknown> : {};
    const metadata = typeof record.$metadata === 'object' && record.$metadata !== null
      ? record.$metadata as Record<string, unknown>
      : {};
    const errorName = typeof record.name === 'string' ? record.name : (error instanceof Error ? error.name : 'UnknownError');
    const statusCode = typeof metadata.httpStatusCode === 'number' ? `, HTTP ${metadata.httpStatusCode}` : '';
    const requestId = typeof metadata.requestId === 'string' ? `, request ${metadata.requestId}` : '';
    this.logger.error(`Profile photo storage ${operation} failed (${errorName}${statusCode}${requestId}).`);
  }

  private avatarConflict() {
    return new ApiException(HttpStatus.CONFLICT, {
      code: 'PROFILE_PHOTO_CONFLICT', message: 'The profile photo changed elsewhere. Reload the page and try again.',
    });
  }

  private notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, { code: 'PROFILE_NOT_FOUND', message: 'Customer profile not found.' });
  }
}
