import { randomUUID } from 'node:crypto';
import createHttpError from 'http-errors';
import type { OrganizationRepository } from '../../domain/repositories/organization-repository.js';
import type { UserRepository } from '../../domain/repositories/user-repository.js';
import type { SessionRepository } from '../../domain/repositories/session-repository.js';
import type { InvitationRepository } from '../../domain/repositories/invitation-repository.js';
import type { TokenManager } from '../ports/token-manager.js';
import type { MailService } from '../ports/mail-service.js';
import type {
  SignInInput,
  SignUpInput,
  InviteUserInput,
  AcceptInvitationInput,
} from '../dtos/auth.dto.js';
import { generateSlug } from '../../utils/slug.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { tokenSha256 } from '../../utils/token-hash.js';
import { renderInvitationEmail } from '../../infrastructure/mail/templates/invitation.js';

export class AuthService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly invitationRepository: InvitationRepository,
    private readonly tokenManager: TokenManager,
    private readonly mailService: MailService,
  ) {}

  public async signUp(input: SignUpInput) {
    const slug = generateSlug(input.organizationName);
    const existingOrg = await this.organizationRepository.findBySlug(slug);
    if (existingOrg) {
      throw createHttpError(409, 'Organization already exists. Choose a different name.');
    }

    const organization = await this.organizationRepository.create({
      name: input.organizationName,
      slug,
      defaultLocale: input.defaultLocale,
    });

    const passwordHash = await hashPassword(input.admin.password);
    const adminUser = await this.userRepository.create({
      organizationId: organization.id,
      email: input.admin.email.toLowerCase(),
      passwordHash,
      firstName: input.admin.firstName,
      lastName: input.admin.lastName,
      role: 'admin',
      locale: input.defaultLocale,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const tokenPair = await this.tokenManager.createTokenPair({
      sub: adminUser.id,
      org: organization.id,
      role: adminUser.role,
      locale: adminUser.locale,
    });

    const refreshTokenHash = tokenSha256(tokenPair.refreshToken);
    await this.sessionRepository.create({
      id: tokenPair.sessionId,
      userId: adminUser.id,
      refreshTokenHash,
      userAgent: 'signup',
      ipAddress: '0.0.0.0',
      expiresAt: tokenPair.refreshTokenExpiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      organization,
      user: adminUser,
      tokens: tokenPair,
    };
  }

  public async signIn(input: SignInInput) {
    const normalizedSlug = generateSlug(input.organizationSlug);
    const organization = await this.organizationRepository.findBySlug(normalizedSlug);
    if (!organization) {
      throw createHttpError(404, 'Organization not found.');
    }

    const user = await this.userRepository.findByEmail(input.email.toLowerCase(), organization.id);
    if (!user) {
      throw createHttpError(401, 'Invalid credentials.');
    }

    const isValidPassword = await verifyPassword(user.passwordHash, input.password);
    if (!isValidPassword) {
      throw createHttpError(401, 'Invalid credentials.');
    }

    const tokenPair = await this.tokenManager.createTokenPair({
      sub: user.id,
      org: organization.id,
      role: user.role,
      locale: user.locale,
    });

    const refreshTokenHash = tokenSha256(tokenPair.refreshToken);
    await this.sessionRepository.create({
      id: tokenPair.sessionId,
      userId: user.id,
      refreshTokenHash,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      expiresAt: tokenPair.refreshTokenExpiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      organization,
      user,
      tokens: tokenPair,
    };
  }

  public async signOut(sessionId: string) {
    await this.sessionRepository.deleteById(sessionId);
  }

  public async refreshSession(refreshToken: string, userAgent: string, ipAddress: string) {
    const decoded = await this.tokenManager.verifyRefreshToken(refreshToken);
    const hashedToken = tokenSha256(refreshToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(hashedToken);
    if (!session || session.expiresAt < new Date()) {
      throw createHttpError(401, 'Session expired.');
    }

    await this.sessionRepository.deleteById(decoded.sessionId);

    const user = await this.userRepository.findById(decoded.sub);
    if (!user) {
      throw createHttpError(401, 'User not found.');
    }

    const organization = await this.organizationRepository.findById(decoded.org);
    if (!organization) {
      throw createHttpError(401, 'Organization not found.');
    }

    const tokenPair = await this.tokenManager.createTokenPair({
      sub: user.id,
      org: organization.id,
      role: user.role,
      locale: user.locale,
    });

    const refreshTokenHash = tokenSha256(tokenPair.refreshToken);
    await this.sessionRepository.create({
      id: tokenPair.sessionId,
      userId: user.id,
      refreshTokenHash,
      userAgent,
      ipAddress,
      expiresAt: tokenPair.refreshTokenExpiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      organization,
      user,
      tokens: tokenPair,
    };
  }

  public async inviteUser(input: InviteUserInput) {
    const existingInvitation = await this.invitationRepository.findPendingByEmail(
      input.email,
      input.organizationId,
    );

    if (existingInvitation) {
      throw createHttpError(409, 'User already has a pending invitation.');
    }

    const organization = await this.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw createHttpError(404, 'Organization not found.');
    }

    const inviter = await this.userRepository.findById(input.invitedBy);

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await this.invitationRepository.create({
      organizationId: input.organizationId,
      email: input.email.toLowerCase(),
      role: input.role,
      token,
      status: 'pending',
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const acceptUrl = `${process.env.APP_BASE_URL}/accept-invitation?token=${token}`;
    const roleLabels =
      organization.defaultLocale === 'es'
        ? {
            admin: 'Administrador',
            project_manager: 'Project manager',
            member: 'Miembro',
            stakeholder: 'Interesado',
          }
        : {
            admin: 'Admin',
            project_manager: 'Project manager',
            member: 'Member',
            stakeholder: 'Stakeholder',
          };
    const emailContent = renderInvitationEmail({
      organizationName: organization.name,
      invitedByName: inviter ? `${inviter.firstName} ${inviter.lastName}` : 'Admin Platform',
      acceptUrl,
      role: roleLabels[input.role],
      expiresAt,
      locale: organization.defaultLocale,
    });

    await this.mailService.sendMail({
      to: input.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return invitation;
  }

  public async listInvitations(organizationId: string) {
    return this.invitationRepository.findByOrganization(organizationId);
  }

  public async cancelInvitation(organizationId: string, invitationId: string) {
    const invitation = await this.invitationRepository.findById(invitationId);

    if (!invitation || invitation.organizationId !== organizationId) {
      throw createHttpError(404, 'Invitation not found for this organization.');
    }

    if (invitation.status !== 'pending') {
      throw createHttpError(400, 'Only pending invitations can be canceled.');
    }

    await this.invitationRepository.deleteById(invitationId);
  }

  public async acceptInvitation(input: AcceptInvitationInput) {
    const invitation = await this.invitationRepository.findByToken(input.token);
    if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
      throw createHttpError(400, 'Invitation is not valid.');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepository.create({
      organizationId: invitation.organizationId,
      email: invitation.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: invitation.role,
      locale: 'en',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.invitationRepository.markAsAccepted(invitation.id);

    return user;
  }
}

