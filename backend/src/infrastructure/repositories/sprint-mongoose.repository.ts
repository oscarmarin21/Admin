import { Types } from 'mongoose';
import { SprintModel, toSprint } from '../database/models/sprint.model.js';
import type { SprintRepository } from '../../domain/repositories/sprint-repository.js';
import type { Sprint, SprintId } from '../../domain/entities/sprint.js';
import type { ProjectId } from '../../domain/entities/project.js';

export class SprintMongooseRepository implements SprintRepository {
  async create(payload: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sprint> {
    const doc = await SprintModel.create({
      ...payload,
      projectId: new Types.ObjectId(payload.projectId),
    });
    return toSprint(doc);
  }

  async findById(id: SprintId, projectId: ProjectId): Promise<Sprint | null> {
    const doc = await SprintModel.findOne({
      _id: id,
      projectId: new Types.ObjectId(projectId),
    });
    return doc ? toSprint(doc) : null;
  }

  async findByProject(projectId: ProjectId): Promise<Sprint[]> {
    const docs = await SprintModel.find({
      projectId: new Types.ObjectId(projectId),
    }).sort({ startDate: 1 });
    return docs.map(toSprint);
  }

  async update(id: SprintId, projectId: ProjectId, payload: Partial<Sprint>): Promise<Sprint> {
    const doc = await SprintModel.findOneAndUpdate(
      { _id: id, projectId: new Types.ObjectId(projectId) },
      payload,
      { new: true, runValidators: true },
    );
    if (!doc) {
      throw new Error('Sprint not found');
    }
    return toSprint(doc);
  }

  async delete(id: SprintId, projectId: ProjectId): Promise<void> {
    await SprintModel.deleteOne({ _id: id, projectId: new Types.ObjectId(projectId) });
  }
}

