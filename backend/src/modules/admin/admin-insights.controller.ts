import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { PlatformAdminGuard } from '../auth/platform-admin.guard';
import { SessionGuard } from '../auth/session.guard';
import { AdminService } from './admin.service';

@Controller('admin/insights')
@UseGuards(SessionGuard, PlatformAdminGuard)
export class AdminInsightsController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  insights() {
    return this.admin.insights();
  }
}
