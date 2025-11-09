import { Types } from 'mongoose';
import { TaskModel, toTask } from '../database/models/task.model.js';
import type {
  TaskRepository,
  TaskQueryFilters,
} from '../../domain/repositories/task-repository.js';
import type { Task, TaskId, TaskStatus } from '../../domain/entities/task.js';
import type { ProjectId } from '../../domain/entities/project.js';
import type { SprintId } from '../../domain/entities/sprint.js';
import type { UserId } from '../../domain/entities/user.js';

export class TaskMongooseRepository implements TaskRepository {
  async create(payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const doc = await TaskModel.create({
      ...payload,
      projectId: new Types.ObjectId(payload.projectId),
      sprintId: payload.sprintId ? new Types.ObjectId(payload.sprintId) : null,
      assigneeId: payload.assigneeId ? new Types.ObjectId(payload.assigneeId) : null,
    });
    return toTask(doc);
  }

  async findById(id: TaskId, projectId: ProjectId): Promise<Task | null> {
    const doc = await TaskModel.findOne({
      _id: id,
      projectId: new Types.ObjectId(projectId),
    });
    return doc ? toTask(doc) : null;
  }

  async findByProject(projectId: ProjectId): Promise<Task[]> {
    const docs = await TaskModel.find({
      projectId: new Types.ObjectId(projectId),
    }).sort({ createdAt: -1 });
    return docs.map(toTask);
  }

  async findManyByProjectIds(projectIds: ProjectId[], filters: TaskQueryFilters): Promise<Task[]> {
    const query: Record<string, unknown> = {
      projectId: { $in: projectIds.map((id) => new Types.ObjectId(id)) },
    };

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.assigneeId) {
      query.assigneeId = new Types.ObjectId(filters.assigneeId as UserId);
    }
    if (filters.blocked !== undefined) {
      query.blocked = filters.blocked;
    }
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.dueDateFrom || filters.dueDateTo) {
      query.dueDate = {};
      if (filters.dueDateFrom) {
        (query.dueDate as Record<string, unknown>).$gte = filters.dueDateFrom;
      }
      if (filters.dueDateTo) {
        (query.dueDate as Record<string, unknown>).$lte = filters.dueDateTo;
      }
    }

    const docs = await TaskModel.find(query).sort({ updatedAt: -1 });
    return docs.map(toTask);
  }

  async findBySprint(projectId: ProjectId, sprintId: SprintId): Promise<Task[]> {
    const docs = await TaskModel.find({
      projectId: new Types.ObjectId(projectId),
      sprintId: new Types.ObjectId(sprintId),
    });
    return docs.map(toTask);
  }

  async update(id: TaskId, projectId: ProjectId, payload: Partial<Task>): Promise<Task> {
    const updatePayload: Record<string, unknown> = {
      ...payload,
    };

    if (payload.sprintId !== undefined) {
      updatePayload.sprintId = payload.sprintId ? new Types.ObjectId(payload.sprintId) : null;
    }
    if (payload.assigneeId !== undefined) {
      updatePayload.assigneeId = payload.assigneeId ? new Types.ObjectId(payload.assigneeId) : null;
    }

    const doc = await TaskModel.findOneAndUpdate(
      { _id: id, projectId: new Types.ObjectId(projectId) },
      updatePayload,
      { new: true, runValidators: true },
    );
    if (!doc) {
      throw new Error('Task not found');
    }
    return toTask(doc);
  }

  async updateStatus(id: TaskId, projectId: ProjectId, status: TaskStatus): Promise<Task> {
    const doc = await TaskModel.findOneAndUpdate(
      { _id: id, projectId: new Types.ObjectId(projectId) },
      { status },
      { new: true, runValidators: true },
    );
    if (!doc) {
      throw new Error('Task not found');
    }
    return toTask(doc);
  }

  async delete(id: TaskId, projectId: ProjectId): Promise<void> {
    await TaskModel.deleteOne({ _id: id, projectId: new Types.ObjectId(projectId) });
  }
}

