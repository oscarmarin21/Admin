import { Types } from 'mongoose';
import { InvitationModel, toInvitation } from '../database/models/invitation.model.js';
import type { InvitationRepository } from '../../domain/repositories/invitation-repository.js';
import type { Invitation } from '../../domain/entities/invitation.js';
import type { OrganizationId } from '../../domain/entities/organization.js';
import type { InvitationId } from '../../domain/entities/invitation.js';

export class InvitationMongooseRepository implements InvitationRepository {
  async create(payload: Omit<Invitation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invitation> {
    const doc = await InvitationModel.create({
      ...payload,
      organizationId: new Types.ObjectId(payload.organizationId),
    });
    return toInvitation(doc);
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const doc = await InvitationModel.findOne({ token });
    return doc ? toInvitation(doc) : null;
  }

  async findById(id: InvitationId): Promise<Invitation | null> {
    const doc = await InvitationModel.findById(id);
    return doc ? toInvitation(doc) : null;
  }

  async findPendingByEmail(email: string, organizationId: OrganizationId): Promise<Invitation | null> {
    const doc = await InvitationModel.findOne({
      email,
      organizationId: new Types.ObjectId(organizationId),
      status: 'pending',
    });
    return doc ? toInvitation(doc) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Invitation[]> {
    const docs = await InvitationModel.find({
      organizationId: new Types.ObjectId(organizationId),
    }).sort({ createdAt: -1 });
    return docs.map(toInvitation);
  }

  async markAsAccepted(id: InvitationId): Promise<void> {
    await InvitationModel.findByIdAndUpdate(id, { status: 'accepted' });
  }

  async deleteById(id: InvitationId): Promise<void> {
    await InvitationModel.findByIdAndDelete(id);
  }
}

