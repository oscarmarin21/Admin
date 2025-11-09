import type { UserId } from './user.js';

export type SessionId = string;

export interface Session {
  id: SessionId;
  userId: UserId;
  refreshTokenHash: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

