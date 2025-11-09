import createHttpError from 'http-errors';
import type { TaskRepository } from '../../domain/repositories/task-repository.js';
import type { TaskHistoryRepository } from '../../domain/repositories/task-history-repository.js';
import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import type { SprintRepository } from '../../domain/repositories/sprint-repository.js';
import type { UserRepository } from '../../domain/repositories/user-repository.js';
import type { Task, TaskId, TaskStatus } from '../../domain/entities/task.js';
import type { TaskHistory } from '../../domain/entities/task-history.js';
import type { ProjectId } from '../../domain/entities/project.js';
import type { SprintId } from '../../domain/entities/sprint.js';
import type { OrganizationId } from '../../domain/entities/organization.js';
import type { UserId } from '../../domain/entities/user.js';

export class TaskService {
  async listTasksForOrganization(
    organizationId: OrganizationId,
    filters: {
      projectId?: ProjectId;
      status?: TaskStatus;
      priority?: 'low' | 'medium' | 'high';
      assigneeId?: UserId;
      search?: string;
      blocked?: boolean;
      dueDateFrom?: Date;
      dueDateTo?: Date;
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

    return this.taskRepository.findManyByProjectIds(projectIds, filters);
  }

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskHistoryRepository: TaskHistoryRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly sprintRepository: SprintRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private async ensureProject(organizationId: OrganizationId, projectId: ProjectId) {
    const project = await this.projectRepository.findById(projectId, organizationId);
    if (!project) {
      throw createHttpError(404, 'Project not found.');
    }
    return project;
  }

  private async ensureSprint(projectId: ProjectId, sprintId?: SprintId | null) {
    if (!sprintId) {
      return null;
    }
    const sprint = await this.sprintRepository.findById(sprintId, projectId);
    if (!sprint) {
      throw createHttpError(404, 'Sprint not found.');
    }
    return sprint;
  }

  private async ensureUser(organizationId: OrganizationId, userId?: UserId | null) {
    if (!userId) {
      return null;
    }
    const user = await this.userRepository.findById(userId);
    if (!user || user.organizationId !== organizationId) {
      throw createHttpError(400, 'Assignee must belong to the organization.');
    }
    return user;
  }

  async createTask(
    organizationId: OrganizationId,
    projectId: ProjectId,
    payload: Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
    actorId: UserId,
  ) {
    await this.ensureProject(organizationId, projectId);
    await this.ensureSprint(projectId, payload.sprintId);
    await this.ensureUser(organizationId, payload.assigneeId);

    const task = await this.taskRepository.create({
      ...payload,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Task);

    await this.taskHistoryRepository.create({
      taskId: task.id,
      changedBy: actorId,
      changes: { action: 'created', payload },
      createdAt: new Date(),
    });

    return task;
  }

  async listTasks(organizationId: OrganizationId, projectId: ProjectId) {
    await this.ensureProject(organizationId, projectId);
    return this.taskRepository.findByProject(projectId);
  }

  async updateTask(
    organizationId: OrganizationId,
    projectId: ProjectId,
    taskId: TaskId,
    payload: Partial<Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>,
    actorId: UserId,
  ) {
    await this.ensureProject(organizationId, projectId);
    if (payload.sprintId) {
      await this.ensureSprint(projectId, payload.sprintId);
    }
    if (payload.assigneeId) {
      await this.ensureUser(organizationId, payload.assigneeId);
    }
    const updatedTask = await this.taskRepository.update(taskId, projectId, {
      ...payload,
      updatedAt: new Date(),
    } as Task);

    await this.taskHistoryRepository.create({
      taskId,
      changedBy: actorId,
      changes: payload as Record<string, unknown>,
      createdAt: new Date(),
    });

    return updatedTask;
  }

  async updateStatus(
    organizationId: OrganizationId,
    projectId: ProjectId,
    taskId: TaskId,
    status: TaskStatus,
    actorId: UserId,
  ) {
    await this.ensureProject(organizationId, projectId);
    const updatedTask = await this.taskRepository.updateStatus(taskId, projectId, status);
    await this.taskHistoryRepository.create({
      taskId,
      changedBy: actorId,
      changes: { status },
      createdAt: new Date(),
    });

    return updatedTask;
  }

  async deleteTask(organizationId: OrganizationId, projectId: ProjectId, taskId: TaskId, actorId: UserId) {
    await this.ensureProject(organizationId, projectId);
    await this.taskRepository.delete(taskId, projectId);
    await this.taskHistoryRepository.create({
      taskId,
      changedBy: actorId,
      changes: { action: 'deleted' },
      createdAt: new Date(),
    });
  }

  async getHistory(organizationId: OrganizationId, projectId: ProjectId, taskId: TaskId) {
    await this.ensureProject(organizationId, projectId);
    return this.taskHistoryRepository.findByTask(taskId);
  }
}

