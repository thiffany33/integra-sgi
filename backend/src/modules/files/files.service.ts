import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { filesManifest } from '@integra/shared/documents';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { ObjectStorageService } from '../storage/object-storage.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly storage: ObjectStorageService, private readonly prisma: PrismaService) {}

  async getTemplateUrl(documentId: string, downloader?: { userId: string; isAdmin: boolean }): Promise<string> {
    const document = filesManifest.find((entry) => entry.id === documentId);
    if (!document) throw new NotFoundException('Template not found.');
    const url = await this.storage.getSignedReadUrl({ key: document.objectKey, expiresInSeconds: 300 });
    // Only customers' downloads feed the indicators; a failure to count never blocks the download.
    if (downloader && !downloader.isAdmin) {
      await this.prisma.templateDownload.create({ data: { userId: downloader.userId, documentId: document.id } })
        .catch((error: unknown) => this.logger.warn(`Template download not counted (${error instanceof Error ? error.name : 'unknown'}).`));
    }
    return url;
  }
}
