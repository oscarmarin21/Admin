import type { Invitation, InvitationId } from '../entities/invitation.js';
import type { OrganizationId } from '../entities/organization.js';

export interface InvitationRepository {
  create(payload: Omit<Invitation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invitation>;
  findByToken(token: string): Promise<Invitation | null>;
  findById(id: InvitationId): Promise<Invitation | null>;
  findPendingByEmail(email: string, organizationId: OrganizationId): Promise<Invitation | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Invitation[]>;
  markAsAccepted(id: InvitationId): Promise<void>;
  deleteById(id: InvitationId): Promise<void>;
}

