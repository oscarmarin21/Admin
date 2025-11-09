import { Schema, model, type Document, type Model, Types } from 'mongoose';
import type { Meeting } from '../../../domain/entities/meeting.js';

interface MeetingDocument extends Document {
  projectId: Types.ObjectId;
  sprintId?: Types.ObjectId | null;
  type: string;
  date: Date;
  summary?: string;
  decisions?: string;
  actionItems?: string;
  followUpOwner?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<MeetingDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint', default: null },
    type: {
      type: String,
      enum: ['daily', 'review', 'retro', 'planning', 'other'],
      default: 'daily',
    },
    date: { type: Date, required: true },
    summary: { type: String, required: false, default: undefined },
    decisions: { type: String, required: false, default: undefined },
    actionItems: { type: String, required: false, default: undefined },
    followUpOwner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const MeetingModel: Model<MeetingDocument> = model<MeetingDocument>('Meeting', MeetingSchema);

export const toMeeting = (doc: MeetingDocument): Meeting => ({
  id: doc.id,
  projectId: doc.projectId.toString(),
  sprintId: doc.sprintId ? doc.sprintId.toString() : undefined,
  type: doc.type as Meeting['type'],
  date: doc.date,
  summary: doc.summary ?? undefined,
  decisions: doc.decisions ?? undefined,
  actionItems: doc.actionItems ?? undefined,
  followUpOwner: doc.followUpOwner ? doc.followUpOwner.toString() : undefined,
  createdBy: doc.createdBy.toString(),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export { MeetingModel, type MeetingDocument };

