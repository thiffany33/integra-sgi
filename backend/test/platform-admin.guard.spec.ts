import { describe, expect, it } from 'vitest';
import type { ExecutionContext } from '@nestjs/common';
import { PlatformAdminGuard } from '../src/modules/auth/platform-admin.guard';

describe('PlatformAdminGuard', () => {
  const guard = new PlatformAdminGuard();
  const context = (isAdmin?: boolean) => ({ switchToHttp: () => ({ getRequest: () => ({ isAdmin }) }) }) as ExecutionContext;

  it('permits only platform administrators', () => {
    expect(guard.canActivate(context(true))).toBe(true);
    for (const isAdmin of [false, undefined]) {
      expect(() => guard.canActivate(context(isAdmin))).toThrowError(expect.objectContaining({
        response: { error: { code: 'FORBIDDEN', message: expect.any(String) } },
      }));
    }
  });
});
