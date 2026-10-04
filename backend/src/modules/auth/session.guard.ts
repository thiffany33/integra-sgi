import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ApiException } from '../../utils/api-exception';
import { AuthService } from './auth.service';
import { SESSION_COOKIE_NAME } from './session-cookie';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionToken = request.cookies?.[SESSION_COOKIE_NAME];
    if (!sessionToken) throw this.unauthenticated();

    const session = await this.authService.validateSession(sessionToken);
    if (!session) throw this.unauthenticated();

    request.userId = session.userId;
    request.userRole = session.role;
    return true;
  }

  private unauthenticated(): ApiException {
    return new ApiException(HttpStatus.UNAUTHORIZED, {
      code: 'UNAUTHENTICATED',
      message: 'Please sign in to continue.',
    });
  }
}
