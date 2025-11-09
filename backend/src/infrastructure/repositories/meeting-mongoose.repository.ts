import { Types } from 'mongoose';
import { MeetingModel, toMeeting } from '../database/models/meeting.model.js';
import type {
  MeetingRepository,
  MeetingQueryFilters,
} from '../../domain/repositories/meeting-repository.js';
import type { Meeting, MeetingId } from '../../domain/entities/meeting.js';
import type { ProjectId } from '../../domain/entities/project.js';

export class MeetingMongooseRepository implements MeetingRepository {
  async create(payload: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    const doc = await MeetingModel.create({
      ...payload,
      summary: payload.summary ?? undefined,
      decisions: payload.decisions ?? undefined,
      actionItems: payload.actionItems ?? undefined,
      projectId: new Types.ObjectId(payload.projectId),
      sprintId: payload.sprintId ? new Types.ObjectId(payload.sprintId) : null,
      followUpOwner: payload.followUpOwner ? new Types.ObjectId(payload.followUpOwner) : null,
      createdBy: new Types.ObjectId(payload.createdBy),
    });
    return toMeeting(doc);
  }

  async findById(id: MeetingId, projectId: ProjectId): Promise<Meeting | null> {
    const doc = await MeetingModel.findOne({
      _id: id,
      projectId: new Types.ObjectId(projectId),
    });
    return doc ? toMeeting(doc) : null;
  }

  async findByProject(projectId: ProjectId): Promise<Meeting[]> {
    const docs = await MeetingModel.find({
      projectId: new Types.ObjectId(projectId),
    }).sort({ date: -1 });
    return docs.map(toMeeting);
  }

  async findManyByProjectIds(projectIds: ProjectId[], filters: MeetingQueryFilters): Promise<Meeting[]> {
    const query: Record<string, unknown> = {
      projectId: { $in: projectIds.map((id) => new Types.ObjectId(id)) },
    };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.search) {
      query.$or = [
        { summary: { $regex: filters.search, $options: 'i' } },
        { decisions: { $regex: filters.search, $options: 'i' } },
        { actionItems: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      query.date = {};
      if (filters.dateFrom) {
        (query.date as Record<string, unknown>).$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        (query.date as Record<string, unknown>).$lte = filters.dateTo;
      }
    }

    const docs = await MeetingModel.find(query).sort({ date: -1 });
    return docs.map(toMeeting);
  }

  async update(
    id: MeetingId,
    projectId: ProjectId,
    payload: Partial<Meeting>,
  ): Promise<Meeting> {
    const updatePayload: Record<string, unknown> = {
      ...payload,
    };
    if (payload.sprintId !== undefined) {
      updatePayload.sprintId = payload.sprintId ? new Types.ObjectId(payload.sprintId) : null;
    }
    if (payload.summary !== undefined) {
      updatePayload.summary = payload.summary ?? undefined;
    }
    if (payload.decisions !== undefined) {
      updatePayload.decisions = payload.decisions ?? undefined;
    }
    if (payload.actionItems !== undefined) {
      updatePayload.actionItems = payload.actionItems ?? undefined;
    }
    if (payload.followUpOwner !== undefined) {
      updatePayload.followUpOwner = payload.followUpOwner
        ? new Types.ObjectId(payload.followUpOwner)
        : null;
    }
    if (payload.createdBy !== undefined) {
      updatePayload.createdBy = new Types.ObjectId(payload.createdBy);
    }

    const doc = await MeetingModel.findOneAndUpdate(
      { _id: id, projectId: new Types.ObjectId(projectId) },
      updatePayload,
      { new: true, runValidators: true },
    );
    if (!doc) {
      throw new Error('Meeting not found');
    }
    return toMeeting(doc);
  }

  async delete(id: MeetingId, projectId: ProjectId): Promise<void> {
    await MeetingModel.deleteOne({ _id: id, projectId: new Types.ObjectId(projectId) });
  }
}

