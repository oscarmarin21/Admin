import { Types } from 'mongoose';
import { MetricSnapshotModel, toMetricSnapshot } from '../database/models/metric-snapshot.model.js';
import type { MetricSnapshotRepository } from '../../domain/repositories/metric-snapshot-repository.js';
import type { MetricSnapshot } from '../../domain/entities/metric-snapshot.js';
import type { ProjectId } from '../../domain/entities/project.js';
import type { SprintId } from '../../domain/entities/sprint.js';

export class MetricSnapshotMongooseRepository implements MetricSnapshotRepository {
  async create(payload: Omit<MetricSnapshot, 'id'>): Promise<MetricSnapshot> {
    const doc = await MetricSnapshotModel.create({
      ...payload,
      projectId: new Types.ObjectId(payload.projectId),
      sprintId: payload.sprintId ? new Types.ObjectId(payload.sprintId) : null,
    });
    return toMetricSnapshot(doc);
  }

  async findLatestByProject(projectId: ProjectId): Promise<MetricSnapshot | null> {
    const doc = await MetricSnapshotModel.findOne({
      projectId: new Types.ObjectId(projectId),
    }).sort({ capturedAt: -1 });
    return doc ? toMetricSnapshot(doc) : null;
  }

  async findByProjectAndSprint(
    projectId: ProjectId,
    sprintId: SprintId,
  ): Promise<MetricSnapshot | null> {
    const doc = await MetricSnapshotModel.findOne({
      projectId: new Types.ObjectId(projectId),
      sprintId: new Types.ObjectId(sprintId),
    }).sort({ capturedAt: -1 });
    return doc ? toMetricSnapshot(doc) : null;
  }
}

