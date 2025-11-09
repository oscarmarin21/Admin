export type MeetingType = 'daily' | 'review' | 'retro' | 'planning' | 'other';

export interface Meeting {
  id: string;
  projectId: string;
  sprintId?: string | null;
  type: MeetingType;
  date: string;
  summary: string;
  decisions: string;
  actionItems: string;
  followUpOwner?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingInput {
  projectId: string;
  sprintId?: string | null;
  type: MeetingType;
  date: string;
  summary: string;
  decisions: string;
  actionItems: string;
  followUpOwner?: string | null;
}

