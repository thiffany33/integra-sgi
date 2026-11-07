import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { filesManifest } from '@integra/shared/documents';
import { validateEnvironment } from '../src/config/configuration';
import { ObjectStorageService } from '../src/modules/storage/object-storage.service';
import { StorageModule } from '../src/modules/storage/storage.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }), StorageModule],
})
class TemplateSyncModule {}

async function findAsset(directory: string, filename: string): Promise<string | undefined> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      const match = await findAsset(path, filename);
      if (match) return match;
    } else if (entry.name === filename) {
      return path;
    }
  }
}

async function syncTemplates(): Promise<void> {
  const app = await NestFactory.createApplicationContext(TemplateSyncModule, { logger: ['error'] });
  try {
    const storage = app.get(ObjectStorageService);
    const assets = await Promise.all(filesManifest.map(async (document) => {
      const sourcePath = await findAsset(join(process.cwd(), 'assets/documents'), document.filename);
      if (!sourcePath) throw new Error(`Template asset is missing: ${document.filename}`);
      return { document, bytes: await readFile(sourcePath) };
    }));
    for (const { document, bytes } of assets) {
      await storage.putObject({ key: document.objectKey, body: bytes, contentType: document.contentType });
      process.stdout.write(`Uploaded ${document.id}\n`);
    }
  } finally {
    await app.close();
  }
}

syncTemplates().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Template sync failed.'}\n`);
  process.exitCode = 1;
});
