import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { UpdateCustomerProfileInput } from '@integra/shared/auth';
import { ApiException } from '../../utils/api-exception';
import { ObjectStorageService } from '../storage/object-storage.service';
import { CustomersRepository } from './customers.repository';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_URL_TTL_SECONDS = 120;
const imageFormats = [
  { extension: 'jpeg', contentType: 'image/jpeg', matches: (bytes: Buffer) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  { extension: 'png', contentType: 'image/png', matches: (bytes: Buffer) => bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { extension: 'webp', contentType: 'image/webp', matches: (bytes: Buffer) => bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' },
] as const;

@Injectable()
export class CustomersService {
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
    return { photoUrl: await this.storage.getSignedReadUrl({ key, expiresInSeconds: AVATAR_URL_TTL_SECONDS }) };
  }

  async uploadAvatar(userId: string, photo: { buffer: Buffer; size: number } | undefined): Promise<{ photoUrl: string }> {
    if (!photo || photo.size < 1 || photo.size > MAX_AVATAR_SIZE) throw this.invalidPhoto();
    const format = imageFormats.find((candidate) => candidate.matches(photo.buffer));
    if (!format) throw this.invalidPhoto();

    const previousKey = await this.repository.getAvatarObjectKey(userId);
    const key = `avatars/${userId}/${randomUUID()}.${format.extension}`;
    await this.storage.putObject({ key, body: photo.buffer, contentType: format.contentType });
    try {
      await this.repository.updateAvatarObjectKey(userId, key);
    } catch {
      try { await this.storage.deleteObject({ key }); } catch { /* preserve the database error response; object cleanup is best effort */ }
      throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, {
        code: 'PROFILE_PHOTO_SAVE_FAILED', message: 'Unable to save profile photo. Please try again.',
      });
    }

    if (previousKey && previousKey !== key) {
      try {
        await this.storage.deleteObject({ key: previousKey });
      } catch {
        try { await this.repository.updateAvatarObjectKey(userId, previousKey); } catch { /* best-effort reference recovery */ }
        try { await this.storage.deleteObject({ key }); } catch { /* best-effort uploaded-object cleanup */ }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, {
          code: 'PROFILE_PHOTO_REPLACE_FAILED', message: 'Unable to replace profile photo. Please try again.',
        });
      }
    }
    return { photoUrl: await this.storage.getSignedReadUrl({ key, expiresInSeconds: AVATAR_URL_TTL_SECONDS }) };
  }

  async deleteAvatar(userId: string): Promise<void> {
    const key = await this.repository.getAvatarObjectKey(userId);
    if (!key) return;
    await this.repository.updateAvatarObjectKey(userId, null);
    try {
      await this.storage.deleteObject({ key });
    } catch {
      try { await this.repository.updateAvatarObjectKey(userId, key); } catch { /* best-effort reference recovery */ }
      throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, {
        code: 'PROFILE_PHOTO_DELETE_FAILED', message: 'Unable to remove profile photo. Please try again.',
      });
    }
  }

  private invalidPhoto() {
    return new ApiException(HttpStatus.BAD_REQUEST, {
      code: 'INVALID_PROFILE_PHOTO', message: 'Choose a JPEG, PNG or WebP image up to 5 MiB.',
    });
  }

  private notFound() {
    return new ApiException(HttpStatus.NOT_FOUND, { code: 'PROFILE_NOT_FOUND', message: 'Customer profile not found.' });
  }
}
