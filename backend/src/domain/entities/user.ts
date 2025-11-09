import type { OrganizationId } from './organization.js';

export type UserId = string;

export type UserRole = 'admin' | 'project_manager' | 'member' | 'stakeholder';

export interface User {
  id: UserId;
  organizationId: OrganizationId;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  locale: 'en' | 'es';
  status: 'active' | 'invited' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

