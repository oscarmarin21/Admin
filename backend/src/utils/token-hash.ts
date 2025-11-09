import { createHash } from 'node:crypto';

export const tokenSha256 = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

