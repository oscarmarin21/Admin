import type { ProjectId } from './project.js';

export type SprintId = string;

export interface Sprint {
  id: SprintId;
  projectId: ProjectId;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

