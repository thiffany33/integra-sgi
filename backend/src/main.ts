import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();

  const configuredPort = app.get(ConfigService).getOrThrow<number>('PORT');
  const port = Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 3001;

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
