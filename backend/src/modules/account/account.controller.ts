import { Body, Controller, Get, Header, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import type { Environment } from '../../config/env.schema';
import { ZodValidationPipe } from '../../middlewares/zod-validation.pipe';
import { SessionGuard } from '../auth/session.guard';
import { clearSessionCookieOptions, SESSION_COOKIE_NAME } from '../auth/session-cookie';
import { deleteAccountSchema, type DeleteAccountInput } from './account.schema';
import { AccountService } from './account.service';

@Controller('account')
@UseGuards(SessionGuard)
export class AccountController {
  private readonly appEnv: Environment['APP_ENV'];

  constructor(private readonly account: AccountService, config: ConfigService) {
    this.appEnv = config.getOrThrow<Environment['APP_ENV']>('APP_ENV');
  }

  @Get('export')
  @Header('Cache-Control', 'no-store')
  @Header('Content-Disposition', 'attachment; filename="integra-sgi-dados.json"')
  export(@Req() request: Request) {
    return this.account.export(request.userId!);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() request: Request,
    @Body(new ZodValidationPipe(deleteAccountSchema)) body: DeleteAccountInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    await this.account.delete(request.userId!, body.password, request.ip);
    response.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions(this.appEnv));
    return { message: 'Account deleted.' };
  }
}
