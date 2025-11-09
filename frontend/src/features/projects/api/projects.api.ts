import { apiClient } from '../../../lib/api-client';
import type { Project, ProjectInput, Task, TaskInput, TaskStatus } from '../types';

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await apiClient.get<Project[]>('/projects');
  return data;
};

export const getProject = async (projectId: string): Promise<Project> => {
  const { data } = await apiClient.get<Project>(`/projects/${projectId}`);
  return data;
};

export const createProject = async (payload: ProjectInput): Promise<Project> => {
  const { data } = await apiClient.post<Project>('/projects', payload);
  return data;
};

export const updateProject = async (
  projectId: string,
  payload: Partial<ProjectInput>,
): Promise<Project> => {
  const { data } = await apiClient.patch<Project>(`/projects/${projectId}`, payload);
  return data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}`);
};

export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
  const { data } = await apiClient.get<Task[]>(`/projects/${projectId}/tasks`);
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
  const { data } = await apiClient.patch<Task>(
    `/projects/${projectId}/tasks/${taskId}`,
    payload,
  );
  return data;
};

export const updateTaskStatus = async (
  projectId: string,
  taskId: string,
  status: TaskStatus,
): Promise<Task> => {
  const { data } = await apiClient.patch<Task>(
    `/projects/${projectId}/tasks/${taskId}/status`,
    { status },
  );
  return data;
};

export const deleteTask = async (projectId: string, taskId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
};

