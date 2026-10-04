import { Module } from '@nestjs/common';
import { EMAIL_SERVICE } from './email.service';
import { ResendEmailAdapter } from './resend-email.adapter';

@Module({ providers: [{ provide: EMAIL_SERVICE, useClass: ResendEmailAdapter }], exports: [EMAIL_SERVICE] })
export class EmailModule {}
