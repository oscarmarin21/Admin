export type ProjectStatus = 'planned' | 'active' | 'on_hold' | 'completed' | 'archived';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  ownerId: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  name: string;
  description?: string;
  status: ProjectStatus;
  ownerId: string;
  startDate?: string;
  endDate?: string;
}

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  projectId: string;
  sprintId?: string | null;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string | null;
  tags: string[];
  dueDate?: string;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string | null;
  tags?: string[];
  dueDate?: string;
  sprintId?: string | null;
  blocked?: boolean;
}

