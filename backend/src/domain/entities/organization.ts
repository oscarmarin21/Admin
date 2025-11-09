export type OrganizationId = string;

export interface Organization {
  id: OrganizationId;
  name: string;
  slug: string;
  defaultLocale: 'en' | 'es';
  createdAt: Date;
  updatedAt: Date;
}

