import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../middlewares/zod-validation.pipe';
import { contactMessageSchema, type ContactMessageInput } from './contact.schema';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  status(): { available: boolean } {
    return { available: this.contact.isAvailable() };
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async send(
    @Body(new ZodValidationPipe(contactMessageSchema)) body: ContactMessageInput,
    @Req() request: Request,
  ): Promise<{ message: string }> {
    await this.contact.send(body, request.ip);
    return { message: 'Message sent.' };
  }
}
