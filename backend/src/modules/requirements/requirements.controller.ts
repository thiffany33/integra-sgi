import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SessionGuard } from '../auth/session.guard';
import { RequirementsService } from './requirements.service';

@Controller('requirements')
@UseGuards(SessionGuard)
export class RequirementsController {
  constructor(private readonly requirements: RequirementsService) {}

  @Get()
  list(@Req() request: Request) {
    return this.requirements.listForUser(request.userId!);
  }
}
