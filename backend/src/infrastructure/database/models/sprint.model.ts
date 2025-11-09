import { Schema, model, type Document, type Model, Types } from 'mongoose';
import type { Sprint } from '../../../domain/entities/sprint.js';

interface SprintDocument extends Document {
  projectId: Types.ObjectId;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SprintSchema = new Schema<SprintDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true },
    goal: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true },
);

const SprintModel: Model<SprintDocument> = model<SprintDocument>('Sprint', SprintSchema);

export const toSprint = (doc: SprintDocument): Sprint => ({
  id: doc.id,
  projectId: doc.projectId.toString(),
  name: doc.name,
  goal: doc.goal ?? undefined,
  startDate: doc.startDate,
  endDate: doc.endDate,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export { SprintModel, type SprintDocument };

