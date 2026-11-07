import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { Environment } from '../../config/env.schema';
import type { EmailService, TransactionalEmail } from './email.service';

@Injectable()
export class ResendEmailAdapter implements EmailService {
  private readonly client: Resend | null;
  private readonly from: string | undefined;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.client = apiKey ? new Resend(apiKey) : null;
    this.from = config.get<Environment['EMAIL_FROM']>('EMAIL_FROM');
  }

  async send(email: TransactionalEmail): Promise<void> {
    if (!this.client || !this.from) throw new Error('Transactional email is not configured.');
    const { error } = await this.client.emails.send({
      from: this.from,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (error) throw new Error('Transactional email delivery failed.');
  }
}
