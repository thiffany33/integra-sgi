import { Injectable, NotFoundException } from '@nestjs/common';
import { filesManifest } from '@integra/shared/documents';
import { ObjectStorageService } from '../storage/object-storage.service';

@Injectable()
export class FilesService {
  constructor(private readonly storage: ObjectStorageService) {}

  async getTemplateUrl(documentId: string): Promise<string> {
    const document = filesManifest.find((entry) => entry.id === documentId);
    if (!document) throw new NotFoundException('Template not found.');
    return this.storage.getSignedReadUrl({ key: document.objectKey, expiresInSeconds: 300 });
  }
}
