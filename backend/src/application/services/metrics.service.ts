import type { TaskRepository } from '../../domain/repositories/task-repository.js';
import type { MetricSnapshotRepository } from '../../domain/repositories/metric-snapshot-repository.js';
import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import type { ProjectId } from '../../domain/entities/project.js';
import type { SprintId } from '../../domain/entities/sprint.js';
import type { OrganizationId } from '../../domain/entities/organization.js';
import type { MetricSnapshot } from '../../domain/entities/metric-snapshot.js';
import type { Task } from '../../domain/entities/task.js';

export interface MetricsResult {
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
}

export class MetricsService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly metricSnapshotRepository: MetricSnapshotRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  private async ensureProject(organizationId: OrganizationId, projectId: ProjectId) {
    const project = await this.projectRepository.findById(projectId, organizationId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  private computeMetrics(tasks: Pick<Task, 'status' | 'blocked'>[]): MetricsResult {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'done').length;
    const blockedTasks = tasks.filter((task) => task.blocked).length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return {
      completionRate,
      totalTasks,
      completedTasks,
      blockedTasks,
    };
  }

  private async persistSnapshot(
    projectId: ProjectId,
    metrics: MetricsResult,
    sprintId?: SprintId | null,
  ): Promise<MetricSnapshot> {
    return this.metricSnapshotRepository.create({
      projectId,
      sprintId: sprintId ?? null,
      completionRate: metrics.completionRate,
      totalTasks: metrics.totalTasks,
      completedTasks: metrics.completedTasks,
      blockedTasks: metrics.blockedTasks,
      capturedAt: new Date(),
    });
  }

  async getProjectMetrics(organizationId: OrganizationId, projectId: ProjectId): Promise<MetricsResult> {
    await this.ensureProject(organizationId, projectId);
    const tasks = await this.taskRepository.findByProject(projectId);
    const metrics = this.computeMetrics(tasks);
    await this.persistSnapshot(projectId, metrics);
    return metrics;
  }

  async getSprintMetrics(
    organizationId: OrganizationId,
    projectId: ProjectId,
    sprintId: SprintId,
  ): Promise<MetricsResult> {
    await this.ensureProject(organizationId, projectId);
    const tasks = await this.taskRepository.findBySprint(projectId, sprintId);
    const metrics = this.computeMetrics(tasks);
    await this.persistSnapshot(projectId, metrics, sprintId);
    return metrics;
  }
}

