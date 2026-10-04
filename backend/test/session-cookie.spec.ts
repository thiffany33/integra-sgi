import { describe, expect, it } from 'vitest';
import { clearSessionCookieOptions, sessionCookieOptions } from '../src/modules/auth/session-cookie';

describe('session cookie options', () => {
  it('uses an HTTP-only lax host-only cookie in production', () => {
    const options = sessionCookieOptions('production');

    expect(options.httpOnly).toBe(true);
    expect(options.secure).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.path).toBe('/');
    expect(options.domain).toBeUndefined();
  });

  it('allows localhost HTTP while testing', () => {
    expect(sessionCookieOptions('test').secure).toBe(false);
  });

  it('clears a cookie using matching security options', () => {
    expect(clearSessionCookieOptions('homolog')).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  });
});
