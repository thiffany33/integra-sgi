import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { AuthModule } from '../auth/auth.module';
import { PlatformAdminGuard } from '../auth/platform-admin.guard';
import { AdminController } from './admin.controller';
import { AdminInsightsController } from './admin-insights.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, AccountModule],
  controllers: [AdminController, AdminInsightsController],
  providers: [PlatformAdminGuard, AdminRepository, AdminService],
})
export class AdminModule {}
