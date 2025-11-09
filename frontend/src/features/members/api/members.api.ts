import { apiClient } from '../../../lib/api-client';

export interface OrganizationMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'project_manager' | 'member' | 'stakeholder';
  status: 'active' | 'invited' | 'suspended';
  locale: 'en' | 'es';
}

export const getOrganizationMembers = async (): Promise<OrganizationMember[]> => {
  const { data } = await apiClient.get<OrganizationMember[]>('/organizations/users');
  return data;
};

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: 'admin' | 'project_manager' | 'member' | 'stakeholder';
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface InviteMemberInput {
  email: string;
  role: Invitation['role'];
}

export const inviteMember = async (payload: InviteMemberInput): Promise<Invitation> => {
  const { data } = await apiClient.post<Invitation>('/auth/invitations', payload);
  return data;
};

export const getInvitations = async (): Promise<Invitation[]> => {
  const { data } = await apiClient.get<Invitation[]>('/auth/invitations');
  return data;
};

export const cancelInvitation = async (invitationId: string): Promise<void> => {
  await apiClient.delete(`/auth/invitations/${invitationId}`);
};

export const updateMemberRole = async (userId: string, role: OrganizationMember['role']) => {
  const { data } = await apiClient.patch<OrganizationMember>(`/organizations/users/${userId}/role`, {
    role,
  });
  return data;
};

export const removeMember = async (userId: string) => {
  await apiClient.delete(`/organizations/users/${userId}`);
};

