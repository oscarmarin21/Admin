import type { RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import createHttpError from 'http-errors';

type ValidationTargets = 'body' | 'query' | 'params';

export const validateRequest =
  (schema: ZodSchema, target: ValidationTargets = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(createHttpError(400, 'Validation failed', { errors: result.error.flatten() }));
    }
    req[target] = result.data;
    return next();
  };

