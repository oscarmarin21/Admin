import { apiClient } from '../../../lib/api-client';
import type { Meeting, MeetingInput, MeetingType } from '../types';

export interface MeetingListFilters {
  projectId?: string;
  type?: MeetingType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const getMeetings = async (filters: MeetingListFilters): Promise<Meeting[]> => {
  const searchParams = new URLSearchParams();
  if (filters.projectId) searchParams.append('projectId', filters.projectId);
  if (filters.type) searchParams.append('type', filters.type);
  if (filters.search) searchParams.append('search', filters.search);
  if (filters.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) searchParams.append('dateTo', filters.dateTo);
  const { data } = await apiClient.get<Meeting[]>(`/meetings?${searchParams.toString()}`);
  return data;
};

export const createMeeting = async (
  projectId: string,
  payload: Omit<MeetingInput, 'projectId'>,
): Promise<Meeting> => {
  const { data } = await apiClient.post<Meeting>(`/projects/${projectId}/meetings`, payload);
  return data;
};

export const updateMeeting = async (
  projectId: string,
  meetingId: string,
  payload: Partial<Omit<MeetingInput, 'projectId'>>,
): Promise<Meeting> => {
  const { data } = await apiClient.patch<Meeting>(
    `/projects/${projectId}/meetings/${meetingId}`,
    payload,
  );
  return data;
};

export const deleteMeeting = async (projectId: string, meetingId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/meetings/${meetingId}`);
};

