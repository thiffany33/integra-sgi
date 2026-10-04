import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LoginInput, RegisterInput } from '@integra/shared/auth';
import type { Request, Response } from 'express';
import type { Environment } from '../../config/env.schema';
import { ZodValidationPipe } from '../../middlewares/zod-validation.pipe';
import { loginSchema, registerSchema, updateLocaleSchema } from '@integra/shared/auth';
import { forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from './password-reset.schema';
import { AuthService } from './auth.service';
import { SessionGuard } from './session.guard';
import {
  clearSessionCookieOptions,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from './session-cookie';

@Controller('auth')
export class AuthController {
  private readonly appEnv: Environment['APP_ENV'];

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.appEnv = configService.getOrThrow<Environment['APP_ENV']>('APP_ENV');
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(body, request.ip);
    response.cookie(SESSION_COOKIE_NAME, result.sessionToken, sessionCookieOptions(this.appEnv));
    return { user: result.user, profile: result.profile };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(body, request.ip);
    response.cookie(SESSION_COOKIE_NAME, result.sessionToken, sessionCookieOptions(this.appEnv));
    return { user: result.user, profile: result.profile };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    await this.authService.logout(request.cookies?.[SESSION_COOKIE_NAME]);
    response.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions(this.appEnv));
    return { message: 'Signed out.' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) body: { email: string },
    @Req() request: Request,
  ) {
    return this.authService.forgotPassword(body.email, request.ip);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: { token: string; password: string },
    @Req() request: Request,
  ) {
    return this.authService.resetPassword(body.token, body.password, request.ip);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) body: { token: string },
    @Req() request: Request,
  ) {
    return this.authService.verifyEmail(body.token, request.ip);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  getMe(@Req() request: Request) {
    return this.authService.getMe(request.userId!);
  }

  @Patch('me/locale')
  @UseGuards(SessionGuard)
  updateLocale(
    @Req() request: Request,
    @Body(new ZodValidationPipe(updateLocaleSchema)) body: { locale: import('@integra/shared/auth').SupportedLocale },
  ) {
    return this.authService.updateLocale(request.userId!, body.locale);
  }
}
