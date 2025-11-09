import createHttpError from 'http-errors';
import type { SprintRepository } from '../../domain/repositories/sprint-repository.js';
import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import type { Sprint, SprintId } from '../../domain/entities/sprint.js';
import type { ProjectId } from '../../domain/entities/project.js';
import type { OrganizationId } from '../../domain/entities/organization.js';

export class SprintService {
  constructor(
    private readonly sprintRepository: SprintRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  private async ensureProjectBelongsToOrganization(
    organizationId: OrganizationId,
    projectId: ProjectId,
  ) {
    const project = await this.projectRepository.findById(projectId, organizationId);
    if (!project) {
      throw createHttpError(404, 'Project not found.');
    }
    return project;
  }

  async createSprint(
    organizationId: OrganizationId,
    projectId: ProjectId,
    payload: Omit<Sprint, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
  ) {
    await this.ensureProjectBelongsToOrganization(organizationId, projectId);
    return this.sprintRepository.create({
      ...payload,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Sprint);
  }

  async listSprints(organizationId: OrganizationId, projectId: ProjectId) {
    await this.ensureProjectBelongsToOrganization(organizationId, projectId);
    return this.sprintRepository.findByProject(projectId);
  }

  async updateSprint(
    organizationId: OrganizationId,
    projectId: ProjectId,
    sprintId: SprintId,
    payload: Partial<Pick<Sprint, 'name' | 'goal' | 'startDate' | 'endDate'>>,
  ) {
    await this.ensureProjectBelongsToOrganization(organizationId, projectId);
    return this.sprintRepository.update(sprintId, projectId, {
      ...payload,
      updatedAt: new Date(),
    } as Sprint);
  }

  async deleteSprint(organizationId: OrganizationId, projectId: ProjectId, sprintId: SprintId) {
    await this.ensureProjectBelongsToOrganization(organizationId, projectId);
    await this.sprintRepository.delete(sprintId, projectId);
  }
}

