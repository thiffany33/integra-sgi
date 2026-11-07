import { ConfigService } from '@nestjs/config';
import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createOriginMiddleware } from './middlewares/origin.middleware';
import { SanitizedExceptionFilter } from './middlewares/sanitized-exception.filter';

export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);
  const frontendUrl = config.getOrThrow<string>('FRONTEND_URL');
  const proxyHops = config.getOrThrow<number>('TRUST_PROXY_HOPS');

  app.setGlobalPrefix('api/v1');
  app.getHttpAdapter().getInstance().set('trust proxy', proxyHops);
  app.use(helmet());
  app.use(cookieParser());
  app.use(createOriginMiddleware(frontendUrl));
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
  });
  app.useGlobalFilters(new SanitizedExceptionFilter());
}
