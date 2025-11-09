import type { TaskHistory } from '../entities/task-history.js';
import type { TaskId } from '../entities/task.js';

export interface TaskHistoryRepository {
  create(payload: Omit<TaskHistory, 'id' | 'createdAt'>): Promise<TaskHistory>;
  findByTask(taskId: TaskId): Promise<TaskHistory[]>;
}

