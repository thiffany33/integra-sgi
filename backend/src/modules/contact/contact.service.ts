import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRateLimitService } from '../auth/auth-rate-limit.service';
import { EMAIL_SERVICE, type EmailService } from '../email/email.service';
import { ApiException } from '../../utils/api-exception';
import type { ContactMessageInput } from './contact.schema';

const unavailable = () => new ApiException(HttpStatus.SERVICE_UNAVAILABLE, {
  code: 'CONTACT_UNAVAILABLE', message: 'Messaging is unavailable. Please try again later.',
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

@Injectable()
export class ContactService {
  private readonly inbox: string | undefined;

  constructor(
    private readonly rateLimit: AuthRateLimitService,
    @Inject(EMAIL_SERVICE) private readonly email: EmailService,
    config: ConfigService,
  ) {
    this.inbox = config.get<string>('CONTACT_EMAIL');
  }

  isAvailable(): boolean {
    return Boolean(this.inbox);
  }

  async send(input: ContactMessageInput, ipAddress: string | undefined): Promise<void> {
    if (!this.inbox) throw unavailable();
    await this.rateLimit.consume('contact', ipAddress, input.email.toLowerCase(), 3, 3600);
    await this.rateLimit.consume('contact-ip', ipAddress, '', 10, 3600);
    // Bots get the same answer as people, so the honeypot is not revealed.
    if (input.website) return;

    const name = input.name.replace(/[\r\n]+/g, ' ');
    try {
      await this.email.send({
        to: this.inbox,
        replyTo: input.email,
        subject: `Contacto pelo site: ${name}`,
        text: `Nome: ${name}\nEmail: ${input.email}\n\n${input.message}`,
        html: `<main><p><strong>Nome:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(input.email)}</p>`
          + `<p style="white-space:pre-wrap">${escapeHtml(input.message)}</p></main>`,
      });
    } catch {
      throw unavailable();
    }
  }
}
