import { Controller, Get, Param, Redirect, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/session.guard';
import { FilesService } from './files.service';

@Controller('files')
@UseGuards(SessionGuard)
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Get('templates/:documentId')
  @Redirect(undefined, 302)
  async getTemplate(@Param('documentId') documentId: string) {
    return { url: await this.files.getTemplateUrl(documentId) };
  }
}
