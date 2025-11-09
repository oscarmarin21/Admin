import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TaskInput, TaskStatus } from '../projects/types';
import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  type TaskListFilters,
} from './api/tasks.api';

const tasksKeys = {
  all: (filters: TaskListFilters) => ['tasks', filters] as const,
};

export const useTasksQuery = (filters: TaskListFilters) =>
  useQuery({
    queryKey: tasksKeys.all(filters),
    queryFn: () => getTasks(filters),
  });

export const useCreateTaskGlobalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: TaskInput }) =>
      createTask(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTaskGlobalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      payload,
    }: {
      projectId: string;
      taskId: string;
      payload: Partial<TaskInput>;
    }) => updateTask(projectId, taskId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTaskStatusGlobalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      status,
    }: {
      projectId: string;
      taskId: string;
      status: TaskStatus;
    }) => updateTaskStatus(projectId, taskId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTaskGlobalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
      deleteTask(projectId, taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

