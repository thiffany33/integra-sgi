import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SupportedLocale } from '@integra/shared/auth';
import { supportedLocales } from '@integra/shared/auth';
import { AuthRepository } from './auth.repository';
import { EMAIL_SERVICE, createAuthEmail, type EmailService } from '../email/email.service';

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthEmailService {
  private readonly appUrl: string;

  constructor(
    private readonly repository: AuthRepository,
    @Inject(EMAIL_SERVICE) private readonly email: EmailService,
    config: ConfigService,
  ) {
    this.appUrl = config.getOrThrow<string>('APP_URL');
  }

  async sendVerification(userId: string, email: string, locale: string): Promise<void> {
    const token = randomBytes(32).toString('base64url');
    await this.repository.createVerificationToken(userId, this.hashToken(token), new Date(Date.now() + VERIFY_TOKEN_TTL_MS));
    const url = new URL('/verify-email', this.appUrl);
    url.searchParams.set('token', token);
    await this.sendBestEffort(email, locale, 'verify', url.toString());
  }

  async requestPasswordReset(email: string): Promise<void> {
    const account = await this.repository.findEmailAccount(email);
    if (!account) return;
    const token = randomBytes(32).toString('base64url');
    await this.repository.createPasswordResetToken(account.id, this.hashToken(token), new Date(Date.now() + RESET_TOKEN_TTL_MS));
    const url = new URL('/reset-password', this.appUrl);
    url.searchParams.set('token', token);
    await this.sendBestEffort(email, account.locale, 'reset', url.toString());
  }

  verifyEmail(token: string): Promise<boolean> {
    return this.repository.verifyEmail(this.hashToken(token), new Date());
  }

  private async sendBestEffort(to: string, locale: string, kind: 'reset' | 'verify', url: string): Promise<void> {
    try {
      const supportedLocale = supportedLocales.includes(locale as SupportedLocale) ? locale as SupportedLocale : 'pt-PT';
      await this.email.send({ ...createAuthEmail(supportedLocale, kind, url), to });
    } catch {
      // Keep account-recovery responses independent of both account existence and provider availability.
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
