import type { Task, TaskId, TaskStatus } from '../entities/task.js';
import type { ProjectId } from '../entities/project.js';
import type { SprintId } from '../entities/sprint.js';
import type { UserId } from '../entities/user.js';

export interface TaskQueryFilters {
  status?: TaskStatus;
  priority?: 'low' | 'medium' | 'high';
  assigneeId?: UserId;
  search?: string;
  blocked?: boolean;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export interface TaskRepository {
  create(payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  findById(id: TaskId, projectId: ProjectId): Promise<Task | null>;
  findByProject(projectId: ProjectId): Promise<Task[]>;
  findBySprint(projectId: ProjectId, sprintId: SprintId): Promise<Task[]>;
  findManyByProjectIds(projectIds: ProjectId[], filters: TaskQueryFilters): Promise<Task[]>;
  update(id: TaskId, projectId: ProjectId, payload: Partial<Task>): Promise<Task>;
  updateStatus(id: TaskId, projectId: ProjectId, status: TaskStatus): Promise<Task>;
  delete(id: TaskId, projectId: ProjectId): Promise<void>;
}

