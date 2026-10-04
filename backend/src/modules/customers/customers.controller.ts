import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { updateCustomerProfileSchema, type UpdateCustomerProfileInput } from '@integra/shared/auth';
import { ZodValidationPipe } from '../../middlewares/zod-validation.pipe';
import { SessionGuard } from '../auth/session.guard';
import { CustomersService } from './customers.service';

@Controller('customers/me')
@UseGuards(SessionGuard)
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  getMe(@Req() request: Request) {
    return this.customers.getMe(request.userId!);
  }

  @Put()
  updateMe(
    @Req() request: Request,
    @Body(new ZodValidationPipe(updateCustomerProfileSchema)) body: UpdateCustomerProfileInput,
  ) {
    return this.customers.updateMe(request.userId!, body);
  }
}
