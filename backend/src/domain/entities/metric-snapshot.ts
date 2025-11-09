import type { ProjectId } from './project.js';
import type { SprintId } from './sprint.js';

export type MetricSnapshotId = string;

export interface MetricSnapshot {
  id: MetricSnapshotId;
  projectId: ProjectId;
  sprintId?: SprintId | null;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  capturedAt: Date;
}

