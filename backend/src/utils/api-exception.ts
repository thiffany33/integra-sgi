import { HttpException, type HttpStatus } from '@nestjs/common';

export type PublicError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};

export class ApiException extends HttpException {
  constructor(status: HttpStatus, error: PublicError) {
    super({ error }, status);
  }
}
