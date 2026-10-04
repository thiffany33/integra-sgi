import 'express';
import type { UserRole } from '@integra/shared/auth';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
    }
  }
}

export {};
