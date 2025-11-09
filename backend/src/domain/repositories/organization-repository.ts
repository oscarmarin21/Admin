import type { Organization, OrganizationId } from '../entities/organization.js';

export interface OrganizationRepository {
  create(payload: Pick<Organization, 'name' | 'slug' | 'defaultLocale'>): Promise<Organization>;
  findById(id: OrganizationId): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  update(
    id: OrganizationId,
    payload: Partial<Pick<Organization, 'name' | 'defaultLocale'>>,
  ): Promise<Organization>;
}

