import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { registerHttpRoutes } from './interfaces/http/routes/index.js';
import { notFoundHandler } from './interfaces/http/middlewares/not-found-handler.js';
import { errorHandler } from './interfaces/http/middlewares/error-handler.js';
import { languageResolver } from './interfaces/http/middlewares/language-resolver.js';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.appBaseUrl,
      credentials: true,
    }),
  );
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true }));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(
    pinoHttp({
      logger,
      customSuccessMessage: () => 'request_completed',
      customErrorMessage: () => 'request_failed',
      customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
      },
    }),
  );
  app.use(languageResolver);

  registerHttpRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

