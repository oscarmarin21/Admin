import { Types } from 'mongoose';
import { TaskHistoryModel, toTaskHistory } from '../database/models/task-history.model.js';
import type { TaskHistoryRepository } from '../../domain/repositories/task-history-repository.js';
import type { TaskHistory } from '../../domain/entities/task-history.js';
import type { TaskId } from '../../domain/entities/task.js';

export class TaskHistoryMongooseRepository implements TaskHistoryRepository {
  async create(payload: Omit<TaskHistory, 'id'>): Promise<TaskHistory> {
    const doc = await TaskHistoryModel.create({
      ...payload,
      taskId: new Types.ObjectId(payload.taskId),
      changedBy: new Types.ObjectId(payload.changedBy),
    });
    return toTaskHistory(doc);
  }

  async findByTask(taskId: TaskId): Promise<TaskHistory[]> {
    const docs = await TaskHistoryModel.find({
      taskId: new Types.ObjectId(taskId),
    }).sort({ createdAt: -1 });
    return docs.map(toTaskHistory);
  }
}

