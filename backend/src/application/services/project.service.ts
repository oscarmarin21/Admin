import createHttpError from 'http-errors';
import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import type { UserRepository } from '../../domain/repositories/user-repository.js';
import type { Project, ProjectId } from '../../domain/entities/project.js';
import type { OrganizationId } from '../../domain/entities/organization.js';
import type { UserId } from '../../domain/entities/user.js';

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createProject(organizationId: OrganizationId, payload: Omit<Project, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) {
    const owner = await this.userRepository.findById(payload.ownerId);
    if (!owner || owner.organizationId !== organizationId) {
      throw createHttpError(400, 'Owner must belong to the organization.');
    }

    return this.projectRepository.create({
      ...payload,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Project);
  }

  async getProject(organizationId: OrganizationId, projectId: ProjectId) {
    const project = await this.projectRepository.findById(projectId, organizationId);
    if (!project) {
      throw createHttpError(404, 'Project not found.');
    }
    return project;
  }

  async listProjects(organizationId: OrganizationId) {
    return this.projectRepository.findAll(organizationId);
  }

  async updateProject(
    organizationId: OrganizationId,
    projectId: ProjectId,
    payload: Partial<Pick<Project, 'name' | 'description' | 'status' | 'startDate' | 'endDate' | 'ownerId'>>,
  ) {
    if (payload.ownerId) {
      await this.ensureUserBelongsToOrganization(organizationId, payload.ownerId);
    }

    return this.projectRepository.update(projectId, organizationId, {
      ...payload,
      updatedAt: new Date(),
    } as Project);
  }

  async deleteProject(organizationId: OrganizationId, projectId: ProjectId) {
    await this.projectRepository.delete(projectId, organizationId);
  }

  private async ensureUserBelongsToOrganization(organizationId: OrganizationId, userId: UserId) {
    const user = await this.userRepository.findById(userId);
    if (!user || user.organizationId !== organizationId) {
      throw createHttpError(400, 'User must belong to the organization.');
    }
  }
}

