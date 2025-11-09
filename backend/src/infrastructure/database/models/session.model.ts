import { Schema, model, type Document, type Model, Types } from 'mongoose';
import type { Session } from '../../../domain/entities/session.js';

interface SessionDocument extends Document {
  _id: string;
  userId: Types.ObjectId;
  refreshTokenHash: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<SessionDocument>(
  {
    _id: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true, index: true },
    userAgent: { type: String, required: true },
    ipAddress: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const SessionModel: Model<SessionDocument> = model<SessionDocument>('Session', SessionSchema);

export const toSession = (doc: SessionDocument): Session => ({
  id: doc._id,
  userId: doc.userId.toString(),
  refreshTokenHash: doc.refreshTokenHash,
  userAgent: doc.userAgent,
  ipAddress: doc.ipAddress,
  expiresAt: doc.expiresAt,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export { SessionModel, type SessionDocument };

