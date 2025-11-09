import { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';
import type { AuthenticatedRequest } from './auth-guard.js';
import type { UserRole } from '../../../domain/entities/user.js';

export const requireRoles =
  (...allowedRoles: UserRole[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const userRole = req.auth?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(createHttpError(403, 'You do not have permission to perform this action.'));
    }
    return next();
  };

