import { Controller, Get, Param, Redirect, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SessionGuard } from '../auth/session.guard';
import { FilesService } from './files.service';

@Controller('files')
@UseGuards(SessionGuard)
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Get('templates/:documentId')
  @Redirect(undefined, 302)
  async getTemplate(@Req() request: Request, @Param('documentId') documentId: string) {
    return { url: await this.files.getTemplateUrl(documentId, { userId: request.userId!, isAdmin: request.isAdmin === true }) };
  }
}
