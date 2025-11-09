import { apiClient } from '../../../lib/api-client';
import type { Task, TaskInput, TaskStatus } from '../../projects/types';

export interface TaskListFilters {
  projectId?: string;
  status?: TaskStatus;
  priority?: 'low' | 'medium' | 'high';
  assigneeId?: string;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  blocked?: boolean;
}

export interface TaskListResponse {
  items: Task[];
}

export const getTasks = async (filters: TaskListFilters): Promise<Task[]> => {
  const searchParams = new URLSearchParams();
  if (filters.projectId) searchParams.append('projectId', filters.projectId);
  if (filters.status) searchParams.append('status', filters.status);
  if (filters.priority) searchParams.append('priority', filters.priority);
  if (filters.assigneeId) searchParams.append('assigneeId', filters.assigneeId);
  if (filters.search) searchParams.append('search', filters.search);
  if (filters.dueDateFrom) searchParams.append('dueDateFrom', filters.dueDateFrom);
  if (filters.dueDateTo) searchParams.append('dueDateTo', filters.dueDateTo);
  if (filters.blocked !== undefined) searchParams.append('blocked', String(filters.blocked));

  const { data } = await apiClient.get<Task[]>(`/tasks?${searchParams.toString()}`);
  return data;
};

export const createTask = async (projectId: string, payload: TaskInput): Promise<Task> => {
  const { data } = await apiClient.post<Task>(`/projects/${projectId}/tasks`, payload);
  return data;
};

export const updateTask = async (
  projectId: string,
  taskId: string,
  payload: Partial<TaskInput>,
): Promise<Task> => {
  const { data } = await apiClient.patch<Task>(`/projects/${projectId}/tasks/${taskId}`, payload);
  return data;
};

export const updateTaskStatus = async (
  projectId: string,
  taskId: string,
  status: TaskStatus,
): Promise<Task> => {
  const { data } = await apiClient.patch<Task>(`/projects/${projectId}/tasks/${taskId}/status`, {
    status,
  });
  return data;
};

export const deleteTask = async (projectId: string, taskId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
};

