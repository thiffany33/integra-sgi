import type { NextFunction, Request, Response } from 'express';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function createOriginMiddleware(frontendUrl: string) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const origin = request.get('origin');
    if (MUTATION_METHODS.has(request.method) && origin && origin !== frontendUrl) {
      response.status(403).json({
        error: { code: 'ORIGIN_NOT_ALLOWED', message: 'This request is not allowed.' },
      });
      return;
    }
    next();
  };
}
