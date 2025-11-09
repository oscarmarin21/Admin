import type { Project, ProjectId } from '../entities/project.js';
import type { OrganizationId } from '../entities/organization.js';

export interface ProjectRepository {
  create(payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  findById(id: ProjectId, organizationId: OrganizationId): Promise<Project | null>;
  findAll(organizationId: OrganizationId): Promise<Project[]>;
  update(
    id: ProjectId,
    organizationId: OrganizationId,
    payload: Partial<Project>,
  ): Promise<Project>;
  delete(id: ProjectId, organizationId: OrganizationId): Promise<void>;
}

