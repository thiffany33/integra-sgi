import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
