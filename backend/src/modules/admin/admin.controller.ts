import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../middlewares/zod-validation.pipe';
import { PlatformAdminGuard } from '../auth/platform-admin.guard';
import { SessionGuard } from '../auth/session.guard';
import { AdminService } from './admin.service';
import { listCustomersSchema, updateCustomerSystemsSchema, type ListCustomersInput, type UpdateCustomerSystemsInput } from './admin.schema';

@Controller('admin/customers')
@UseGuards(SessionGuard, PlatformAdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  listCustomers(@Query(new ZodValidationPipe(listCustomersSchema)) query: ListCustomersInput) {
    return this.admin.listCustomers(query);
  }

  @Patch(':userId/systems')
  updateCustomerSystems(
    @Req() request: Request,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(updateCustomerSystemsSchema)) body: UpdateCustomerSystemsInput,
  ) {
    return this.admin.updateCustomerSystems(request.userId!, userId, body);
  }
}
