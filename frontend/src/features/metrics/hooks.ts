import { useQuery } from '@tanstack/react-query';
import { getProjectMetrics, getSprintMetrics } from './api/metrics.api';

const metricsKeys = {
  project: (projectId: string) => ['metrics', 'projects', projectId] as const,
  sprint: (projectId: string, sprintId: string) =>
    ['metrics', 'projects', projectId, 'sprints', sprintId] as const,
};

export const useProjectMetricsQuery = (projectId: string) =>
  useQuery({
    queryKey: metricsKeys.project(projectId),
    queryFn: () => getProjectMetrics(projectId),
    enabled: !!projectId,
    staleTime: 60_000,
  });

export const useSprintMetricsQuery = (projectId: string, sprintId: string) =>
  useQuery({
    queryKey: metricsKeys.sprint(projectId, sprintId),
    queryFn: () => getSprintMetrics(projectId, sprintId),
    enabled: !!projectId && !!sprintId,
    staleTime: 60_000,
  });


