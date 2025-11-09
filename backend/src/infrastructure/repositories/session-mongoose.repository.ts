import { Types } from 'mongoose';
import { SessionModel, toSession } from '../database/models/session.model.js';
import type { SessionRepository } from '../../domain/repositories/session-repository.js';
import type { Session } from '../../domain/entities/session.js';
import type { SessionId } from '../../domain/entities/session.js';
import type { UserId } from '../../domain/entities/user.js';

export class SessionMongooseRepository implements SessionRepository {
  async create(payload: Omit<Session, 'createdAt' | 'updatedAt'>): Promise<Session> {
    const doc = await SessionModel.create({
      ...payload,
      _id: payload.id,
      userId: new Types.ObjectId(payload.userId),
    });
    return toSession(doc);
  }

  async findById(id: SessionId): Promise<Session | null> {
    const doc = await SessionModel.findById(id);
    return doc ? toSession(doc) : null;
  }

  async findByRefreshTokenHash(hash: string): Promise<Session | null> {
    const doc = await SessionModel.findOne({ refreshTokenHash: hash });
    return doc ? toSession(doc) : null;
  }

  async deleteById(id: SessionId): Promise<void> {
    await SessionModel.findByIdAndDelete(id);
  }

  async deleteByUser(userId: UserId): Promise<void> {
    await SessionModel.deleteMany({ userId: new Types.ObjectId(userId) });
  }
}

