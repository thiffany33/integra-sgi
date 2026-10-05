import { describe, expect, it } from 'vitest';
import { envSchema } from '../src/config/env.schema';

const developmentEnv = {
  APP_ENV: 'development',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/integra',
  DIRECT_URL: 'postgresql://user:pass@localhost:5432/integra',
  FRONTEND_URL: 'http://localhost:5173',
  APP_URL: 'http://localhost:5173',
  SESSION_SECRET: 'development-secret-with-at-least-32-characters',
};

const storageEnv = {
  AWS_ACCESS_KEY_ID: 'test-access-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret-key',
  AWS_ENDPOINT_URL_S3: 'https://storage.example.test',
  AWS_REGION: 'us-east-2',
};

describe('envSchema', () => {
  it('accepts valid local configuration and supplies safe defaults', () => {
    const result = envSchema.parse(developmentEnv);

    expect(result.APP_ENV).toBe('development');
    expect(result.PORT).toBe(3001);
    expect(result.TRUST_PROXY_HOPS).toBe(0);
  });

  it('allows local development to leave Resend unconfigured', () => {
    expect(envSchema.parse({ ...developmentEnv, RESEND_API_KEY: '' }).RESEND_API_KEY).toBeUndefined();
  });

  it('requires the direct database URL in deployed environments', () => {
    expect(
      envSchema.safeParse({
        ...developmentEnv,
        APP_ENV: 'homolog',
        DIRECT_URL: undefined,
      }).success,
    ).toBe(false);
  });

  it('requires Resend credentials in deployed environments', () => {
    expect(
      envSchema.safeParse({
        ...developmentEnv,
        APP_ENV: 'production',
        DIRECT_URL: developmentEnv.DATABASE_URL,
        SESSION_SECRET: 'production-secret-with-at-least-32-characters',
      }).success,
    ).toBe(false);
  });

  it('rejects frontend URLs with paths because CORS expects an origin', () => {
    expect(
      envSchema.safeParse({ ...developmentEnv, FRONTEND_URL: 'http://localhost:5173/dashboard' }).success,
    ).toBe(false);
  });

  it('accepts complete backend storage configuration', () => {
    const result = envSchema.parse({ ...developmentEnv, ...storageEnv });
    expect(result.AWS_ENDPOINT_URL_S3).toBe(storageEnv.AWS_ENDPOINT_URL_S3);
  });

  it.each(Object.keys(storageEnv))('rejects a missing %s when storage is configured', (missingKey) => {
    expect(envSchema.safeParse({
      ...developmentEnv,
      ...storageEnv,
      [missingKey]: undefined,
    }).success).toBe(false);
  });

  it.each(Object.keys(storageEnv))('requires %s in deployed environments', (missingKey) => {
    expect(envSchema.safeParse({
      ...developmentEnv,
      ...storageEnv,
      APP_ENV: 'homolog',
      NODE_ENV: 'production',
      APP_URL: 'https://app.example.test',
      FRONTEND_URL: 'https://app.example.test',
      RESEND_API_KEY: 'resend-test',
      EMAIL_FROM: 'noreply@example.test',
      [missingKey]: undefined,
    }).success).toBe(false);
  });

  it.each(['not-a-url', 'ftp://storage.example.test', 'https://user:password@storage.example.test'])('rejects an invalid storage endpoint %s', (endpoint) => {
    expect(envSchema.safeParse({
      ...developmentEnv,
      ...storageEnv,
      AWS_ENDPOINT_URL_S3: endpoint,
    }).success).toBe(false);
  });
});
