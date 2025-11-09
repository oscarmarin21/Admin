import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelInvitation,
  getInvitations,
  getOrganizationMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  type InviteMemberInput,
} from './api/members.api';

const membersKeys = {
  all: ['organization', 'members'] as const,
  invitations: ['organization', 'invitations'] as const,
};

export const useOrganizationMembersQuery = () =>
  useQuery({ queryKey: membersKeys.all, queryFn: getOrganizationMembers });

export const useInvitationsQuery = () =>
  useQuery({ queryKey: membersKeys.invitations, queryFn: getInvitations });

export const useInviteMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteMemberInput) => inviteMember(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: membersKeys.invitations });
    },
  });
};

export const useCancelInvitationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => cancelInvitation(invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: membersKeys.invitations });
    },
  });
};

export const useUpdateMemberRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: Parameters<typeof updateMemberRole>[1];
    }) => updateMemberRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: membersKeys.all });
    },
  });
};

export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: membersKeys.all });
    },
  });
};

