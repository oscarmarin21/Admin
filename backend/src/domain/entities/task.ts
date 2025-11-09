import type { ProjectId } from './project.js';
import type { SprintId } from './sprint.js';
import type { UserId } from './user.js';

export type TaskId = string;

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: TaskId;
  projectId: ProjectId;
  sprintId?: SprintId | null;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assigneeId?: UserId | null;
  tags: string[];
  dueDate?: Date;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

