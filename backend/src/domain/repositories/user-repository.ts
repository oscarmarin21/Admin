import type { User, UserId, UserRole } from '../entities/user.js';
import type { OrganizationId } from '../entities/organization.js';

export interface UserRepository {
  create(payload: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findByEmail(email: string, organizationId: OrganizationId): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  findByOrganization(organizationId: OrganizationId): Promise<User[]>;
  updateRole(id: UserId, role: UserRole): Promise<User>;
  update(id: UserId, payload: Partial<User>): Promise<User>;
  delete(id: UserId): Promise<void>;
}

