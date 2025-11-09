import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { logger } from '../../../config/logger.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const httpError =
    err instanceof createHttpError.HttpError
      ? err
      : createHttpError(500, (err as Error)?.message ?? 'Internal Server Error');

  if (httpError.status >= 500) {
    logger.error(
      { err: httpError, stack: (httpError as Error).stack },
      'Unhandled error captured by middleware',
    );
  }

  res.status(httpError.status).json({
    message: httpError.message,
    details: (httpError as createHttpError.HttpError)?.errors ?? undefined,
  });
};

