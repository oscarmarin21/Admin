import type { Meeting, MeetingId } from '../entities/meeting.js';
import type { ProjectId } from '../entities/project.js';

export interface MeetingQueryFilters {
  type?: Meeting['type'];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface MeetingRepository {
  create(payload: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting>;
  findById(id: MeetingId, projectId: ProjectId): Promise<Meeting | null>;
  findByProject(projectId: ProjectId): Promise<Meeting[]>;
  findManyByProjectIds(projectIds: ProjectId[], filters: MeetingQueryFilters): Promise<Meeting[]>;
  update(id: MeetingId, projectId: ProjectId, payload: Partial<Meeting>): Promise<Meeting>;
  delete(id: MeetingId, projectId: ProjectId): Promise<void>;
}

