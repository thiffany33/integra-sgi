import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

type ErrorEnvelope = { error: { code: string; message: string; fields?: Record<string, string> } };

@Catch()
export class SanitizedExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const original = exception instanceof HttpException ? exception.getResponse() : undefined;
    const body = this.toEnvelope(status, original);

    response.status(status).json(body);
  }

  private toEnvelope(status: number, original: unknown): ErrorEnvelope {
    if (this.isRecord(original) && this.isRecord(original.error)) {
      const error = original.error;
      const envelope: ErrorEnvelope['error'] = {
        code: typeof error.code === 'string' ? error.code : 'REQUEST_FAILED',
        message: typeof error.message === 'string' ? error.message : 'The request could not be completed.',
      };

      if (this.isStringRecord(error.fields)) envelope.fields = error.fields;
      return { error: envelope };
    }

    if (status === HttpStatus.UNAUTHORIZED) {
      return { error: { code: 'UNAUTHENTICATED', message: 'Please sign in to continue.' } };
    }
    if (status === HttpStatus.FORBIDDEN) {
      return { error: { code: 'FORBIDDEN', message: 'This request is not allowed.' } };
    }
    if (status === HttpStatus.NOT_FOUND) {
      return { error: { code: 'NOT_FOUND', message: 'The requested resource was not found.' } };
    }
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      return { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } };
    }
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      return { error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } };
    }
    return { error: { code: 'REQUEST_FAILED', message: 'The request could not be completed.' } };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private isStringRecord(value: unknown): value is Record<string, string> {
    return this.isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
  }
}
