import { Types } from 'mongoose';
import { UserModel, toUser } from '../database/models/user.model.js';
import type { UserRepository } from '../../domain/repositories/user-repository.js';
import type { User, UserId, UserRole } from '../../domain/entities/user.js';
import type { OrganizationId } from '../../domain/entities/organization.js';

export class UserMongooseRepository implements UserRepository {
  async create(payload: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const doc = await UserModel.create({
      ...payload,
      organizationId: new Types.ObjectId(payload.organizationId),
    });
    return toUser(doc);
  }

  async findByEmail(email: string, organizationId: OrganizationId): Promise<User | null> {
    const doc = await UserModel.findOne({
      email,
      organizationId: new Types.ObjectId(organizationId),
    });
    return doc ? toUser(doc) : null;
  }

  async findById(id: UserId): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? toUser(doc) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<User[]> {
    const docs = await UserModel.find({ organizationId: new Types.ObjectId(organizationId) });
    return docs.map(toUser);
  }

  async updateRole(id: UserId, role: UserRole): Promise<User> {
    const doc = await UserModel.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
    if (!doc) {
      throw new Error('User not found');
    }
    return toUser(doc);
  }

  async update(id: UserId, payload: Partial<User>): Promise<User> {
    const doc = await UserModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!doc) {
      throw new Error('User not found');
    }
    return toUser(doc);
  }

  async delete(id: UserId): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }
}

