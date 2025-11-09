import { Schema, model, type Document, type Model, Types } from 'mongoose';
import type { Task } from '../../../domain/entities/task.js';

interface TaskDocument extends Document {
  projectId: Types.ObjectId;
  sprintId?: Types.ObjectId | null;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeId?: Types.ObjectId | null;
  tags: string[];
  dueDate?: Date;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<TaskDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint', default: null },
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    tags: { type: [String], default: [] },
    dueDate: Date,
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const TaskModel: Model<TaskDocument> = model<TaskDocument>('Task', TaskSchema);

export const toTask = (doc: TaskDocument): Task => ({
  id: doc.id,
  projectId: doc.projectId.toString(),
  sprintId: doc.sprintId ? doc.sprintId.toString() : undefined,
  title: doc.title,
  description: doc.description ?? undefined,
  status: doc.status as Task['status'],
  priority: doc.priority as Task['priority'],
  assigneeId: doc.assigneeId ? doc.assigneeId.toString() : undefined,
  tags: doc.tags,
  dueDate: doc.dueDate ?? undefined,
  blocked: doc.blocked,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export { TaskModel, type TaskDocument };

