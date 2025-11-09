import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { env } from '../../../config/env.js';

export interface AuthUser {
  id: string;
  organizationId: string;
  role: string;
  locale: string;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthUser;
}

export const authGuard = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    throw createHttpError(401, 'Missing authorization header.');
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw createHttpError(401, 'Invalid authorization header.');
  }

  try {
    const decoded = jwt.verify(token, env.accessTokenPrivateKey, {
      issuer: 'admin-platform',
    }) as jwt.JwtPayload & {
      sub: string;
      org: string;
      role: string;
      locale: string;
    };

    req.auth = {
      id: decoded.sub,
      organizationId: decoded.org,
      role: decoded.role,
      locale: decoded.locale,
    };

    next();
  } catch (error) {
    next(createHttpError(401, 'Invalid or expired token.', { cause: error }));
  }
};

