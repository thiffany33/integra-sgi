import type { IncomingMessage, ServerResponse } from 'node:http';

type ExpressHandler = (request: IncomingMessage, response: ServerResponse) => void;
let expressHandler: ExpressHandler | undefined;

async function getExpressHandler(): Promise<ExpressHandler> {
  if (expressHandler) return expressHandler;
  const [{ NestFactory }, { AppModule }, { configureApp }] = await Promise.all([
    import('@nestjs/core'),
    import('../dist/app.module'),
    import('../dist/configure-app'),
  ]);
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.init();
  expressHandler = app.getHttpAdapter().getInstance() as ExpressHandler;
  return expressHandler;
}

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const express = await getExpressHandler();
  express(request, response);
}
