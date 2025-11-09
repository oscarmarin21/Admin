import { Schema, model, type Document, type Model, Types } from 'mongoose';
import type { TaskHistory } from '../../../domain/entities/task-history.js';

interface TaskHistoryDocument extends Document {
  taskId: Types.ObjectId;
  changedBy: Types.ObjectId;
  changes: Record<string, unknown>;
  createdAt: Date;
}

const TaskHistorySchema = new Schema<TaskHistoryDocument>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changes: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const TaskHistoryModel: Model<TaskHistoryDocument> = model<TaskHistoryDocument>(
  'TaskHistory',
  TaskHistorySchema,
);

export const toTaskHistory = (doc: TaskHistoryDocument): TaskHistory => ({
  id: doc.id,
  taskId: doc.taskId.toString(),
  changedBy: doc.changedBy.toString(),
  changes: doc.changes,
  createdAt: doc.createdAt,
});

export { TaskHistoryModel, type TaskHistoryDocument };

