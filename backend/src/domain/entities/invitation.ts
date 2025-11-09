import type { OrganizationId } from './organization.js';
import type { UserRole } from './user.js';

export type InvitationId = string;

export interface Invitation {
  id: InvitationId;
  organizationId: OrganizationId;
  email: string;
  role: UserRole;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

