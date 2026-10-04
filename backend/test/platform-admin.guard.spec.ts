import { describe, expect, it } from 'vitest';
import type { ExecutionContext } from '@nestjs/common';
import { PlatformAdminGuard } from '../src/modules/auth/platform-admin.guard';

describe('PlatformAdminGuard', () => {
  const guard = new PlatformAdminGuard();
  const context = (role?: string) => ({ switchToHttp: () => ({ getRequest: () => ({ userRole: role }) }) }) as ExecutionContext;

  it('permits only platform administrators', () => {
    expect(guard.canActivate(context('PLATFORM_ADMIN'))).toBe(true);
    for (const role of ['CUSTOMER', undefined]) {
      expect(() => guard.canActivate(context(role))).toThrowError(expect.objectContaining({
        response: { error: { code: 'FORBIDDEN', message: expect.any(String) } },
      }));
    }
  });
});
