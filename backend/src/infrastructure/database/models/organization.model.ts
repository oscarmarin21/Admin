import { Schema, model, type Document, type Model } from 'mongoose';
import type { Organization } from '../../../domain/entities/organization.js';

interface OrganizationDocument extends Document {
  name: string;
  slug: string;
  defaultLocale: 'en' | 'es';
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<OrganizationDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    defaultLocale: { type: String, enum: ['en', 'es'], default: 'en' },
  },
  { timestamps: true },
);

const OrganizationModel: Model<OrganizationDocument> =
  model<OrganizationDocument>('Organization', OrganizationSchema);

export const toOrganization = (doc: OrganizationDocument): Organization => ({
  id: doc.id,
  name: doc.name,
  slug: doc.slug,
  defaultLocale: doc.defaultLocale,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export { OrganizationModel, type OrganizationDocument };

