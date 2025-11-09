import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProjectInput, TaskInput, TaskStatus } from './types';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProject,
  getProjectTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from './api/projects.api';

const projectsKeys = {
  all: ['projects'] as const,
  detail: (projectId: string) => ['projects', projectId] as const,
  tasks: (projectId: string) => ['projects', projectId, 'tasks'] as const,
};

export const useProjectsQuery = () => useQuery({ queryKey: projectsKeys.all, queryFn: getProjects });

export const useProjectQuery = (projectId: string) =>
  useQuery({ queryKey: projectsKeys.detail(projectId), queryFn: () => getProject(projectId), enabled: !!projectId });

export const useProjectTasksQuery = (projectId: string) =>
  useQuery({
    queryKey: projectsKeys.tasks(projectId),
    queryFn: () => getProjectTasks(projectId),
    enabled: !!projectId,
  });

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectInput) => createProject(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectsKeys.all });
    },
  });
};

export const useUpdateProjectMutation = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProjectInput>) => updateProject(projectId, payload),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      void queryClient.invalidateQueries({ queryKey: projectsKeys.detail(projectId) });
      if (project) {
        void queryClient.setQueryData(projectsKeys.detail(projectId), project);
      }
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectsKeys.all });
    },
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { projectId: string; payload: TaskInput }) =>
      createTask(variables.projectId, variables.payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: projectsKeys.tasks(variables.projectId) });
    },
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { projectId: string; taskId: string; payload: Partial<TaskInput> }) =>
      updateTask(variables.projectId, variables.taskId, variables.payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: projectsKeys.tasks(variables.projectId) });
    },
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { projectId: string; taskId: string; status: TaskStatus }) =>
      updateTaskStatus(variables.projectId, variables.taskId, variables.status),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: projectsKeys.tasks(variables.projectId) });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { projectId: string; taskId: string }) =>
      deleteTask(variables.projectId, variables.taskId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: projectsKeys.tasks(variables.projectId) });
    },
  });
};

