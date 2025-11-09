import { Schema, model, type Document, type Model, Types } from 'mongoose';
import type { User } from '../../../domain/entities/user.js';

interface UserDocument extends Document {
  organizationId: Types.ObjectId;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  locale: 'en' | 'es';
  status: 'active' | 'invited' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'project_manager', 'member', 'stakeholder'],
      default: 'member',
    },
    locale: { type: String, enum: ['en', 'es'], default: 'en' },
    status: { type: String, enum: ['active', 'invited', 'suspended'], default: 'active' },
  },
  { timestamps: true },
);

const UserModel: Model<UserDocument> = model<UserDocument>('User', UserSchema);

export const toUser = (doc: UserDocument): User => ({
  id: doc.id,
  organizationId: doc.organizationId.toString(),
  email: doc.email,
  passwordHash: doc.passwordHash,
  firstName: doc.firstName,
  lastName: doc.lastName,
  role: doc.role as User['role'],
  locale: doc.locale,
  status: doc.status,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export { UserModel, type UserDocument };

