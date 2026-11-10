import { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';
import type { Request } from 'express';
import { RetentionController } from '../src/modules/retention/retention.controller';
import type { RetentionService } from '../src/modules/retention/retention.service';

describe('RetentionController', () => {
  it('answers 404 when no job secret is configured, so the route does not exist', () => {
    const retention = { purgeExpired: vi.fn() };
    const controller = new RetentionController(retention as unknown as RetentionService, new ConfigService({}));
    expect(() => controller.purge({ headers: { authorization: 'Bearer anything' } } as Request))
      .toThrow(expect.objectContaining({ status: 404 }));
    expect(retention.purgeExpired).not.toHaveBeenCalled();
  });
});
