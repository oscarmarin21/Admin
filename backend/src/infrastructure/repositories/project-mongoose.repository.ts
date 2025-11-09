import { Types } from 'mongoose';
import { ProjectModel, toProject } from '../database/models/project.model.js';
import type { ProjectRepository } from '../../domain/repositories/project-repository.js';
import type { Project, ProjectId } from '../../domain/entities/project.js';
import type { OrganizationId } from '../../domain/entities/organization.js';

export class ProjectMongooseRepository implements ProjectRepository {
  async create(payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const doc = await ProjectModel.create({
      ...payload,
      organizationId: new Types.ObjectId(payload.organizationId),
      ownerId: new Types.ObjectId(payload.ownerId),
    });
    return toProject(doc);
  }

  async findById(id: ProjectId, organizationId: OrganizationId): Promise<Project | null> {
    const doc = await ProjectModel.findOne({
      _id: id,
      organizationId: new Types.ObjectId(organizationId),
    });
    return doc ? toProject(doc) : null;
  }

  async findAll(organizationId: OrganizationId): Promise<Project[]> {
    const docs = await ProjectModel.find({
      organizationId: new Types.ObjectId(organizationId),
    }).sort({ createdAt: -1 });
    return docs.map(toProject);
  }

  async update(
    id: ProjectId,
    organizationId: OrganizationId,
    payload: Partial<Project>,
  ): Promise<Project> {
    const updatePayload: Record<string, unknown> = {
      ...payload,
    };
    if (payload.ownerId) {
      updatePayload.ownerId = new Types.ObjectId(payload.ownerId);
    }

    const doc = await ProjectModel.findOneAndUpdate(
      { _id: id, organizationId: new Types.ObjectId(organizationId) },
      updatePayload,
      { new: true, runValidators: true },
    );

    if (!doc) {
      throw new Error('Project not found');
    }

    return toProject(doc);
  }

  async delete(id: ProjectId, organizationId: OrganizationId): Promise<void> {
    await ProjectModel.deleteOne({ _id: id, organizationId: new Types.ObjectId(organizationId) });
  }
}

