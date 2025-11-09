import { Schema, model, type Document, type Model, Types } from 'mongoose';
import type { Project } from '../../../domain/entities/project.js';

interface ProjectDocument extends Document {
  organizationId: Types.ObjectId;
  name: string;
  description?: string;
  status: string;
  ownerId: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ['planned', 'active', 'on_hold', 'completed', 'archived'],
      default: 'planned',
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true },
);

const ProjectModel: Model<ProjectDocument> = model<ProjectDocument>('Project', ProjectSchema);

export const toProject = (doc: ProjectDocument): Project => ({
  id: doc.id,
  organizationId: doc.organizationId.toString(),
  name: doc.name,
  description: doc.description,
  status: doc.status as Project['status'],
  ownerId: doc.ownerId.toString(),
  startDate: doc.startDate ?? undefined,
  endDate: doc.endDate ?? undefined,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export { ProjectModel, type ProjectDocument };

