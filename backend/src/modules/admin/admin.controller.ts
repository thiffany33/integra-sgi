import { Body, Controller, Get, Header, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../middlewares/zod-validation.pipe';
import { PlatformAdminGuard } from '../auth/platform-admin.guard';
import { SessionGuard } from '../auth/session.guard';
import { deleteAccountSchema, type DeleteAccountInput } from '../account/account.schema';
import { AccountService } from '../account/account.service';
import { AdminService } from './admin.service';
import { listCustomersSchema, updateCustomerSystemsSchema, type ListCustomersInput, type UpdateCustomerSystemsInput } from './admin.schema';

@Controller('admin/customers')
@UseGuards(SessionGuard, PlatformAdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService, private readonly account: AccountService) {}

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

  @Get(':userId/export')
  @Header('Cache-Control', 'no-store')
  @Header('Content-Disposition', 'attachment; filename="integra-sgi-dados.json"')
  exportCustomer(@Req() request: Request, @Param('userId') userId: string) {
    return this.account.exportCustomer(request.userId!, userId);
  }

  @Post(':userId/delete')
  @HttpCode(HttpStatus.OK)
  async deleteCustomer(
    @Req() request: Request,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(deleteAccountSchema)) body: DeleteAccountInput,
  ): Promise<{ message: string }> {
    await this.account.deleteCustomer(request.userId!, body.password, userId, request.ip);
    return { message: 'Customer deleted.' };
  }
}
