import type { OrganizationId } from './organization.js';
import type { UserId } from './user.js';

export type ProjectId = string;

export interface Project {
  id: ProjectId;
  organizationId: OrganizationId;
  name: string;
  description?: string;
  status: 'planned' | 'active' | 'on_hold' | 'completed' | 'archived';
  ownerId: UserId;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

