import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MeetingInput, MeetingType } from './types';
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  type MeetingListFilters,
} from './api/meetings.api';

const meetingsKey = (filters: MeetingListFilters) => ['meetings', filters] as const;

export const useMeetingsQuery = (filters: MeetingListFilters) =>
  useQuery({
    queryKey: meetingsKey(filters),
    queryFn: () => getMeetings(filters),
  });

export const useCreateMeetingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: Omit<MeetingInput, 'projectId'>;
    }) => createMeeting(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
};

export const useUpdateMeetingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      meetingId,
      payload,
    }: {
      projectId: string;
      meetingId: string;
      payload: Partial<Omit<MeetingInput, 'projectId'>>;
    }) => updateMeeting(projectId, meetingId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
};

export const useDeleteMeetingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, meetingId }: { projectId: string; meetingId: string }) =>
      deleteMeeting(projectId, meetingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
};

