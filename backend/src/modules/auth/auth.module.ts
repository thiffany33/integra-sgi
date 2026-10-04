import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { AuthEmailService } from './auth-email.service';
import { AuthController } from './auth.controller';
import { AuthRateLimitRepository } from './auth-rate-limit.repository';
import { AuthRateLimitService } from './auth-rate-limit.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { PasswordHashingService } from './password-hashing.service';
import { SessionGuard } from './session.guard';

@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    AuthRateLimitRepository,
    AuthRateLimitService,
    AuthService,
    AuthEmailService,
    PasswordHashingService,
    SessionGuard,
  ],
  exports: [AuthService, SessionGuard],
})
export class AuthModule {}
