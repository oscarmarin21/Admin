import { Schema, model, type Document, type Model, Types } from 'mongoose';
import type { MetricSnapshot } from '../../../domain/entities/metric-snapshot.js';

interface MetricSnapshotDocument extends Document {
  projectId: Types.ObjectId;
  sprintId?: Types.ObjectId | null;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  capturedAt: Date;
}

const MetricSnapshotSchema = new Schema<MetricSnapshotDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint', default: null },
    completionRate: { type: Number, required: true },
    totalTasks: { type: Number, required: true },
    completedTasks: { type: Number, required: true },
    blockedTasks: { type: Number, required: true },
    capturedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

MetricSnapshotSchema.index({ projectId: 1, capturedAt: -1 });

const MetricSnapshotModel: Model<MetricSnapshotDocument> = model<MetricSnapshotDocument>(
  'MetricSnapshot',
  MetricSnapshotSchema,
);

export const toMetricSnapshot = (doc: MetricSnapshotDocument): MetricSnapshot => ({
  id: doc.id,
  projectId: doc.projectId.toString(),
  sprintId: doc.sprintId ? doc.sprintId.toString() : undefined,
  completionRate: doc.completionRate,
  totalTasks: doc.totalTasks,
  completedTasks: doc.completedTasks,
  blockedTasks: doc.blockedTasks,
  capturedAt: doc.capturedAt,
});

export { MetricSnapshotModel, type MetricSnapshotDocument };

