import type { Environment } from './env.schema';
import { envSchema } from './env.schema';

export function validateEnvironment(environment: Record<string, unknown>): Environment {
  return envSchema.parse(environment);
}

export function loadConfiguration(): Environment {
  return validateEnvironment(process.env);
}
