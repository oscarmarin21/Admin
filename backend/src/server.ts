import mongoose from 'mongoose';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const bootstrap = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongodbUri);
    logger.info('Connected to MongoDB');

    const app = createApp();

    app.listen(env.port, () => {
      logger.info(`HTTP server listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to bootstrap application');
    process.exit(1);
  }
};

void bootstrap();

