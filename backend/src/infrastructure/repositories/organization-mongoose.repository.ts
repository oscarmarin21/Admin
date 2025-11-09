import { OrganizationModel, toOrganization } from '../database/models/organization.model.js';
import type { OrganizationRepository } from '../../domain/repositories/organization-repository.js';
import type { Organization, OrganizationId } from '../../domain/entities/organization.js';

export class OrganizationMongooseRepository implements OrganizationRepository {
  async create(payload: Pick<Organization, 'name' | 'slug' | 'defaultLocale'>): Promise<Organization> {
    const organization = await OrganizationModel.create(payload);
    return toOrganization(organization);
  }

  async findById(id: OrganizationId): Promise<Organization | null> {
    const organization = await OrganizationModel.findById(id);
    return organization ? toOrganization(organization) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const organization = await OrganizationModel.findOne({ slug });
    return organization ? toOrganization(organization) : null;
  }

  async update(
    id: OrganizationId,
    payload: Partial<Pick<Organization, 'name' | 'defaultLocale'>>,
  ): Promise<Organization> {
    const organization = await OrganizationModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return toOrganization(organization);
  }
}

