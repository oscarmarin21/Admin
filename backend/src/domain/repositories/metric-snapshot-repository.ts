import type { MetricSnapshot } from '../entities/metric-snapshot.js';
import type { ProjectId } from '../entities/project.js';
import type { SprintId } from '../entities/sprint.js';

export interface MetricSnapshotRepository {
  create(payload: Omit<MetricSnapshot, 'id'>): Promise<MetricSnapshot>;
  findLatestByProject(projectId: ProjectId): Promise<MetricSnapshot | null>;
  findByProjectAndSprint(projectId: ProjectId, sprintId: SprintId): Promise<MetricSnapshot | null>;
}

