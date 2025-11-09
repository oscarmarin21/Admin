import type { Sprint, SprintId } from '../entities/sprint.js';
import type { ProjectId } from '../entities/project.js';

export interface SprintRepository {
  create(payload: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sprint>;
  findById(id: SprintId, projectId: ProjectId): Promise<Sprint | null>;
  findByProject(projectId: ProjectId): Promise<Sprint[]>;
  update(id: SprintId, projectId: ProjectId, payload: Partial<Sprint>): Promise<Sprint>;
  delete(id: SprintId, projectId: ProjectId): Promise<void>;
}

