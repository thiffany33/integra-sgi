import type { CookieOptions } from 'express';
import type { Environment } from '../../config/env.schema';

export const SESSION_COOKIE_NAME = 'integra_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export function sessionCookieOptions(appEnv: Environment['APP_ENV']): CookieOptions {
  return {
    httpOnly: true,
    secure: appEnv === 'homolog' || appEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000,
  };
}

export function clearSessionCookieOptions(appEnv: Environment['APP_ENV']): CookieOptions {
  const options = sessionCookieOptions(appEnv);
  return {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  };
}
