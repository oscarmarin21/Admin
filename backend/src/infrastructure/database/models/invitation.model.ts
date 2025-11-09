import { Schema, model, type Document, type Model, Types } from 'mongoose';
import type { Invitation } from '../../../domain/entities/invitation.js';

interface InvitationDocument extends Document {
  organizationId: Types.ObjectId;
  email: string;
  role: string;
  token: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<InvitationDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    email: { type: String, required: true, lowercase: true },
    role: { type: String, enum: ['admin', 'project_manager', 'member', 'stakeholder'], required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired', 'revoked'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const InvitationModel: Model<InvitationDocument> = model<InvitationDocument>(
  'Invitation',
  InvitationSchema,
);

export const toInvitation = (doc: InvitationDocument): Invitation => ({
  id: doc.id,
  organizationId: doc.organizationId.toString(),
  email: doc.email,
  role: doc.role as Invitation['role'],
  token: doc.token,
  status: doc.status as Invitation['status'],
  expiresAt: doc.expiresAt,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export { InvitationModel, type InvitationDocument };

