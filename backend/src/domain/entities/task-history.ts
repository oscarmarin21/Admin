import type { TaskId } from './task.js';
import type { UserId } from './user.js';

export type TaskHistoryId = string;

export interface TaskHistory {
  id: TaskHistoryId;
  taskId: TaskId;
  changedBy: UserId;
  changes: Record<string, unknown>;
  createdAt: Date;
}

