import type { Session, SessionId } from '../entities/session.js';
import type { UserId } from '../entities/user.js';

export interface SessionRepository {
  create(payload: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session>;
  findById(id: SessionId): Promise<Session | null>;
  findByRefreshTokenHash(hash: string): Promise<Session | null>;
  deleteById(id: SessionId): Promise<void>;
  deleteByUser(userId: UserId): Promise<void>;
}

