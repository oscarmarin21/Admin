import type { ProjectId } from './project.js';
import type { SprintId } from './sprint.js';
import type { UserId } from './user.js';

export type MeetingId = string;

export interface Meeting {
  id: MeetingId;
  projectId: ProjectId;
  sprintId?: SprintId | null;
  type: 'daily' | 'review' | 'retro' | 'planning' | 'other';
  date: Date;
  summary?: string;
  decisions?: string;
  actionItems?: string;
  followUpOwner?: UserId | null;
  createdBy: UserId;
  createdAt: Date;
  updatedAt: Date;
}

