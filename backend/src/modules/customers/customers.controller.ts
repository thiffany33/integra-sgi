import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('avatar')
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: 5 * 1024 * 1024, files: 1 } }))
  uploadAvatar(@Req() request: Request, @UploadedFile() photo: { buffer: Buffer; size: number } | undefined) {
    return this.customers.uploadAvatar(request.userId!, photo);
  }

  @Get('avatar')
  getAvatar(@Req() request: Request) {
    return this.customers.getAvatar(request.userId!);
  }

  @Delete('avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAvatar(@Req() request: Request) {
    return this.customers.deleteAvatar(request.userId!);
  }
}
