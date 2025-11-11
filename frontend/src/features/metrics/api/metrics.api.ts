import { apiClient } from '../../../lib/api-client';
import type { ProjectMetrics } from '../types';

export const getProjectMetrics = async (projectId: string): Promise<ProjectMetrics> => {
  const { data } = await apiClient.get<ProjectMetrics>(`/metrics/projects/${projectId}/current`);
  return data;
};

export const getSprintMetrics = async (
  projectId: string,
  sprintId: string,
): Promise<ProjectMetrics> => {
  const { data } = await apiClient.get<ProjectMetrics>(
    `/metrics/projects/${projectId}/sprints/${sprintId}`,
  );
  return data;
};


