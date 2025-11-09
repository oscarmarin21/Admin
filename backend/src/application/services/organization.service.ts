import createHttpError from 'http-errors';
import type { OrganizationRepository } from '../../domain/repositories/organization-repository.js';
import type { UserRepository } from '../../domain/repositories/user-repository.js';
import type { OrganizationId } from '../../domain/entities/organization.js';
import type { UserId, UserRole } from '../../domain/entities/user.js';

export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getOrganization(organizationId: OrganizationId) {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw createHttpError(404, 'Organization not found.');
    }

    return organization;
  }

  async updateOrganization(organizationId: OrganizationId, payload: { name?: string; defaultLocale?: 'en' | 'es' }) {
    const organization = await this.organizationRepository.update(organizationId, payload);
    return organization;
  }

  async listMembers(organizationId: OrganizationId) {
    return this.userRepository.findByOrganization(organizationId);
  }

  async updateMemberRole(organizationId: OrganizationId, userId: UserId, role: UserRole) {
    const user = await this.userRepository.findById(userId);
    if (!user || user.organizationId !== organizationId) {
      throw createHttpError(404, 'User not found.');
    }

    return this.userRepository.updateRole(userId, role);
  }

  async removeMember(organizationId: OrganizationId, userId: UserId) {
    const user = await this.userRepository.findById(userId);
    if (!user || user.organizationId !== organizationId) {
      throw createHttpError(404, 'User not found.');
    }

    await this.userRepository.delete(userId);
  }
}

