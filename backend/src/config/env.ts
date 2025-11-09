import 'dotenv/config';
import assert from 'node:assert';

const requiredVariables = [
  'PORT',
  'MONGODB_URI',
  'ACCESS_TOKEN_PRIVATE_KEY',
  'REFRESH_TOKEN_PRIVATE_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'APP_BASE_URL',
];

requiredVariables.forEach((variable) => {
  assert(
    typeof process.env[variable] === 'string' && process.env[variable]!.length > 0,
    `${variable} environment variable is required`,
  );
});

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? '4000'),
  mongodbUri: process.env.MONGODB_URI!,
  accessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE_KEY!,
  refreshTokenPrivateKey: process.env.REFRESH_TOKEN_PRIVATE_KEY!,
  appBaseUrl: process.env.APP_BASE_URL!,
  smtp: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT ?? '587'),
    user: process.env.SMTP_USER!,
    password: process.env.SMTP_PASSWORD!,
  },
};

