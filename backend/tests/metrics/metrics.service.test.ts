import { describe, it, expect, beforeEach } from '@jest/globals';
import type { Task } from '../../src/domain/entities/task.js';
import { MetricsService } from '../../src/application/services/metrics.service.js';

class TaskRepositoryStub {
  tasks: Task[] = [];

  async findByProject() {
    return this.tasks;
  }

  async findBySprint() {
    return this.tasks;
  }
}

class MetricSnapshotRepositoryStub {
  snapshots: any[] = [];

  async create(snapshot: any) {
    this.snapshots.push(snapshot);
    return { id: String(this.snapshots.length), ...snapshot };
  }

  async findLatestByProject() {
    return null;
  }

  async findByProjectAndSprint() {
    return null;
  }
}

class ProjectRepositoryStub {
  async findById() {
    return { id: 'project-1' };
  }
}

describe('MetricsService', () => {
  let taskRepository: TaskRepositoryStub;
  let snapshotRepository: MetricSnapshotRepositoryStub;
  let projectRepository: ProjectRepositoryStub;
  let service: MetricsService;

  beforeEach(() => {
    taskRepository = new TaskRepositoryStub();
    snapshotRepository = new MetricSnapshotRepositoryStub();
    projectRepository = new ProjectRepositoryStub();
    service = new MetricsService(taskRepository as any, snapshotRepository as any, projectRepository as any);
  });

  it('calculates completion rate and persists snapshot', async () => {
    taskRepository.tasks = [
      {
        id: '1',
        projectId: 'project-1',
        title: 'Task 1',
        status: 'done',
        priority: 'medium',
        tags: [],
        blocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Task,
      {
        id: '2',
        projectId: 'project-1',
        title: 'Task 2',
        status: 'doing',
        priority: 'medium',
        tags: [],
        blocked: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Task,
    ];

    const metrics = await service.getProjectMetrics('org-1', 'project-1');

    expect(metrics).toEqual({
      completionRate: 50,
      totalTasks: 2,
      completedTasks: 1,
      blockedTasks: 1,
    });
    expect(snapshotRepository.snapshots).toHaveLength(1);
  });
});

