import { z } from 'zod';

const postgresUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith('postgresql://') || value.startsWith('postgres://'), {
    message: 'Must be a PostgreSQL connection URL.',
  });

const originUrl = z.string().url().refine((value) => {
  const parsed = new URL(value);
  return parsed.pathname === '/' && !parsed.search && !parsed.hash;
}, 'Must be an origin URL without a path.');

const storageValue = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(1).optional(),
);

const storageEndpoint = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.url().refine((value) => {
    try {
      const parsed = new URL(value);
      return (parsed.protocol === 'http:' || parsed.protocol === 'https:')
        && !parsed.username && !parsed.password && !parsed.search && !parsed.hash;
    } catch {
      return false;
    }
  }, 'Must be an HTTP(S) storage endpoint without credentials, query, or fragment.').optional(),
);

export const envSchema = z
  .object({
    APP_ENV: z.enum(['development', 'test', 'homolog', 'production']).default('development'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
    DATABASE_URL: postgresUrl.optional(),
    DIRECT_URL: postgresUrl.optional(),
    APP_URL: originUrl.default('http://localhost:5173'),
    FRONTEND_URL: originUrl.default('http://localhost:5173'),
    SESSION_SECRET: z.string().min(32).optional(),
    RESEND_API_KEY: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      z.string().min(1).optional(),
    ),
    EMAIL_FROM: z.string().min(3).optional(),
    AWS_ACCESS_KEY_ID: storageValue,
    AWS_SECRET_ACCESS_KEY: storageValue,
    AWS_ENDPOINT_URL_S3: storageEndpoint,
    AWS_REGION: storageValue,
  })
  .passthrough()
  .superRefine((environment, context) => {
    const deployed = environment.APP_ENV === 'homolog' || environment.APP_ENV === 'production';
    const needsDatabase = environment.APP_ENV !== 'test';
    const requiredValues: Array<[keyof typeof environment, boolean]> = [
      ['DATABASE_URL', needsDatabase],
      ['DIRECT_URL', deployed],
      ['SESSION_SECRET', environment.APP_ENV !== 'test'],
      ['RESEND_API_KEY', deployed],
      ['EMAIL_FROM', deployed],
      ['AWS_ACCESS_KEY_ID', deployed],
      ['AWS_SECRET_ACCESS_KEY', deployed],
      ['AWS_ENDPOINT_URL_S3', deployed],
      ['AWS_REGION', deployed],
    ];

    const storageKeys = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION'] as const;
    const hasPartialStorage = storageKeys.some((key) => Boolean(environment[key]));
    if (hasPartialStorage) {
      for (const key of storageKeys) {
        if (!environment[key]) {
          context.addIssue({ code: 'custom', path: [key], message: `${key} is required when storage is configured.` });
        }
      }
    }

    for (const [key, required] of requiredValues) {
      if (required && !environment[key]) {
        context.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} is required for ${environment.APP_ENV}.`,
        });
      }
    }

    if (deployed && (!environment.APP_URL.startsWith('https://') || !environment.FRONTEND_URL.startsWith('https://'))) {
      context.addIssue({
        code: 'custom',
        path: ['APP_URL'],
        message: 'APP_URL and FRONTEND_URL must use HTTPS in deployed environments.',
      });
    }

    if (deployed && environment.NODE_ENV !== 'production') {
      context.addIssue({
        code: 'custom',
        path: ['NODE_ENV'],
        message: 'NODE_ENV must be production for deployed environments.',
      });
    }
  });

export type Environment = z.infer<typeof envSchema>;
