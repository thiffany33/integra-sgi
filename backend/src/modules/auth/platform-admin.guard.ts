import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ApiException } from '../../utils/api-exception';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.isAdmin !== true) {
      throw new ApiException(HttpStatus.FORBIDDEN, {
        code: 'FORBIDDEN', message: 'You do not have access to this resource.',
      });
    }
    return true;
  }
}
