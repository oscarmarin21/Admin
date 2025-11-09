import createHttpError from 'http-errors';
import type { MeetingRepository } from '../../domain/repositories/meeting-repository.js';
import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import type { SprintRepository } from '../../domain/repositories/sprint-repository.js';
import type { Meeting, MeetingId } from '../../domain/entities/meeting.js';
import type { ProjectId } from '../../domain/entities/project.js';
import type { OrganizationId } from '../../domain/entities/organization.js';
import type { SprintId } from '../../domain/entities/sprint.js';

export class MeetingService {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly sprintRepository: SprintRepository,
  ) {}

  private async ensureProject(organizationId: OrganizationId, projectId: ProjectId) {
    const project = await this.projectRepository.findById(projectId, organizationId);
    if (!project) {
      throw createHttpError(404, 'Project not found.');
    }
    return project;
  }

  private async ensureSprint(projectId: ProjectId, sprintId?: SprintId | null) {
    if (!sprintId) return null;
    const sprint = await this.sprintRepository.findById(sprintId, projectId);
    if (!sprint) {
      throw createHttpError(404, 'Sprint not found.');
    }
    return sprint;
  }

  async createMeeting(
    organizationId: OrganizationId,
    projectId: ProjectId,
    payload: Omit<Meeting, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
  ) {
    await this.ensureProject(organizationId, projectId);
    await this.ensureSprint(projectId, payload.sprintId ?? null);

    return this.meetingRepository.create({
      ...payload,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Meeting);
  }

  async listMeetings(organizationId: OrganizationId, projectId: ProjectId) {
    await this.ensureProject(organizationId, projectId);
    return this.meetingRepository.findByProject(projectId);
  }

  async listMeetingsForOrganization(
    organizationId: OrganizationId,
    filters: {
      projectId?: ProjectId;
      type?: Meeting['type'];
      search?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ) {
    let projectIds: ProjectId[] = [];
    if (filters.projectId) {
      await this.ensureProject(organizationId, filters.projectId);
      projectIds = [filters.projectId];
    } else {
      const projects = await this.projectRepository.findAll(organizationId);
      projectIds = projects.map((project) => project.id);
    }

    if (projectIds.length === 0) {
      return [];
    }

    return this.meetingRepository.findManyByProjectIds(projectIds, {
      type: filters.type,
      search: filters.search,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
  }

  async getMeeting(organizationId: OrganizationId, projectId: ProjectId, meetingId: MeetingId) {
    await this.ensureProject(organizationId, projectId);
    const meeting = await this.meetingRepository.findById(meetingId, projectId);
    if (!meeting) {
      throw createHttpError(404, 'Meeting not found.');
    }
    return meeting;
  }

  async updateMeeting(
    organizationId: OrganizationId,
    projectId: ProjectId,
    meetingId: MeetingId,
    payload: Partial<Omit<Meeting, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>,
  ) {
    await this.ensureProject(organizationId, projectId);
    if (payload.sprintId) {
      await this.ensureSprint(projectId, payload.sprintId);
    }
    return this.meetingRepository.update(meetingId, projectId, {
      ...payload,
      updatedAt: new Date(),
    } as Meeting);
  }

  async deleteMeeting(organizationId: OrganizationId, projectId: ProjectId, meetingId: MeetingId) {
    await this.ensureProject(organizationId, projectId);
    await this.meetingRepository.delete(meetingId, projectId);
  }
}

